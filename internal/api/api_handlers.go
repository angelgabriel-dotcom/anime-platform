package api

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/yourname/anime-platform/internal/combat"
	"github.com/yourname/anime-platform/internal/models"
	"github.com/yourname/anime-platform/internal/repository"
)

// Handler holds all dependencies
type Handler struct {
	engine     *combat.Engine
	charRepo   *repository.CharacterRepo
	combatRepo *repository.CombatRepo
}

func NewHandler(e *combat.Engine, cr *repository.CharacterRepo, cbr *repository.CombatRepo) *Handler {
	return &Handler{engine: e, charRepo: cr, combatRepo: cbr}
}

// RegisterRoutes attaches all API routes
func RegisterRoutes(r *gin.Engine, h *Handler) {
	v1 := r.Group("/api/v1")
	{
		chars := v1.Group("/characters")
		{
			chars.GET("", h.ListCharacters)
			chars.GET("/:id", h.GetCharacter)
			chars.POST("", h.CreateCharacter)
			chars.PUT("/:id", h.UpdateCharacter)
		}

		battle := v1.Group("/battle")
		{
			battle.POST("/simulate", h.SimulateBattle)
			battle.GET("/:id", h.GetBattle)
			battle.GET("/:id/stream", h.StreamBattleLog)
		}

		v1.GET("/leaderboard", h.GetLeaderboard)
		v1.GET("/leaderboard/series/:name", h.GetLeaderboardBySeries)
	}
}

// ── Battle Handlers ──────────────────────────────────────────────

func (h *Handler) SimulateBattle(c *gin.Context) {
	var req models.BattleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Fetch from DB
	challenger, err := h.charRepo.GetByID(req.Challenger)
	if err != nil || challenger == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "challenger not found: " + req.Challenger})
		return
	}

	opponent, err := h.charRepo.GetByID(req.Opponent)
	if err != nil || opponent == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "opponent not found: " + req.Opponent})
		return
	}

	// Run simulation in goroutine with timeout
	type result struct {
		log *models.CombatLog
		err error
	}
	ch := make(chan result, 1)

	go func() {
		log, err := h.engine.Simulate(c.Request.Context(), challenger, opponent, req.Mode)
		ch <- result{log, err}
	}()

	select {
	case res := <-ch:
		if res.err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": res.err.Error()})
			return
		}

		// Save to DB asynchronously
		go func() {
			if err := h.combatRepo.Save(res.log); err != nil {
				// Log but don't fail the request
				_ = err
			}
		}()

		c.JSON(http.StatusOK, res.log)

	case <-time.After(10 * time.Second):
		c.JSON(http.StatusGatewayTimeout, gin.H{"error": "simulation timed out"})
	}
}

func (h *Handler) GetBattle(c *gin.Context) {
	id := c.Param("id")
	log, err := h.combatRepo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if log == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "battle not found"})
		return
	}
	c.JSON(http.StatusOK, log)
}

func (h *Handler) StreamBattleLog(c *gin.Context) {
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")

	battleID := c.Param("id")
	ticker := time.NewTicker(500 * time.Millisecond)
	defer ticker.Stop()

	round := 1
	for {
		select {
		case <-c.Request.Context().Done():
			return
		case t := <-ticker.C:
			c.SSEvent("round", gin.H{
				"battle_id": battleID,
				"round":     round,
				"timestamp": t,
			})
			c.Writer.Flush()
			round++
			if round > 5 {
				return
			}
		}
	}
}

// ── Character Handlers ───────────────────────────────────────────

func (h *Handler) ListCharacters(c *gin.Context) {
	chars, err := h.charRepo.List()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"characters": chars, "total": len(chars)})
}

func (h *Handler) GetCharacter(c *gin.Context) {
	id := c.Param("id")
	char, err := h.charRepo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if char == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "character not found"})
		return
	}
	c.JSON(http.StatusOK, char)
}

func (h *Handler) CreateCharacter(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented yet"})
}

func (h *Handler) UpdateCharacter(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented yet"})
}

// ── Leaderboard Handlers ─────────────────────────────────────────

func (h *Handler) GetLeaderboard(c *gin.Context) {
	entries, err := h.combatRepo.GetLeaderboard()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"entries": entries, "total": len(entries)})
}

func (h *Handler) GetLeaderboardBySeries(c *gin.Context) {
	series := c.Param("name")
	c.JSON(http.StatusOK, gin.H{"series": series, "entries": []string{}})
}
