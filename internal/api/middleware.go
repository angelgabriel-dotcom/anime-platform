package api

import (
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// ── Request ID ────────────────────────────────────────────────────────────────
// Attaches a unique ID to every request so you can trace it across logs.

func RequestID() gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.GetHeader("X-Request-ID")
		if id == "" {
			id = uuid.NewString()
		}
		c.Set("request_id", id)
		c.Header("X-Request-ID", id)
		c.Next()
	}
}

// ── Logger ────────────────────────────────────────────────────────────────────
// Logs method, path, status, latency and request ID for every request.

func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start  := time.Now()
		path   := c.Request.URL.Path
		method := c.Request.Method

		c.Next()

		latency   := time.Since(start)
		status    := c.Writer.Status()
		requestID := c.GetString("request_id")

		fmt.Printf(
			"[ANIME-API] %s | %d | %12v | %-7s %s | id=%s\n",
			time.Now().Format("2006/01/02 15:04:05"),
			status,
			latency,
			method,
			path,
			requestID,
		)
	}
}

// ── Rate Limiter ──────────────────────────────────────────────────────────────
// Limits each IP to maxRequests per window duration.
// Uses a simple in-memory map — swap for Redis in production.

type rateLimiter struct {
	mu          sync.Mutex
	requests    map[string][]time.Time
	maxRequests int
	window      time.Duration
}

func newRateLimiter(maxRequests int, window time.Duration) *rateLimiter {
	rl := &rateLimiter{
		requests:    make(map[string][]time.Time),
		maxRequests: maxRequests,
		window:      window,
	}
	// Background cleanup — prevents memory leak from stale IPs
	go func() {
		ticker := time.NewTicker(window)
		for range ticker.C {
			rl.mu.Lock()
			cutoff := time.Now().Add(-window)
			for ip, times := range rl.requests {
				var valid []time.Time
				for _, t := range times {
					if t.After(cutoff) {
						valid = append(valid, t)
					}
				}
				if len(valid) == 0 {
					delete(rl.requests, ip)
				} else {
					rl.requests[ip] = valid
				}
			}
			rl.mu.Unlock()
		}
	}()
	return rl
}

func (rl *rateLimiter) allow(ip string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now    := time.Now()
	cutoff := now.Add(-rl.window)

	// Keep only requests within the window
	var valid []time.Time
	for _, t := range rl.requests[ip] {
		if t.After(cutoff) {
			valid = append(valid, t)
		}
	}

	if len(valid) >= rl.maxRequests {
		return false
	}

	rl.requests[ip] = append(valid, now)
	return true
}

// RateLimit returns a Gin middleware that limits requests per IP.
// Example: RateLimit(100, time.Minute) = 100 requests per minute per IP
func RateLimit(maxRequests int, window time.Duration) gin.HandlerFunc {
	limiter := newRateLimiter(maxRequests, window)

	return func(c *gin.Context) {
		ip := c.ClientIP()
		if !limiter.allow(ip) {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error":       "too many requests",
				"retry_after": window.Seconds(),
			})
			return
		}
		c.Next()
	}
}

// ── Error Handler ─────────────────────────────────────────────────────────────
// Catches any unhandled panics and returns a clean JSON error
// instead of crashing the server.

func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				requestID := c.GetString("request_id")
				fmt.Printf("[PANIC] request_id=%s error=%v\n", requestID, err)
				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
					"error":      "internal server error",
					"request_id": requestID,
				})
			}
		}()
		c.Next()
	}
}
