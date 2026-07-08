package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"github.com/yourname/anime-platform/internal/api"
	"github.com/yourname/anime-platform/internal/combat"
	"github.com/yourname/anime-platform/internal/database"
	"github.com/yourname/anime-platform/internal/repository"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	if os.Getenv("GIN_MODE") == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Initialize SQLite database
	if err := database.Init("./data"); err != nil {
		log.Fatalf("database init failed: %v", err)
	}
	defer database.DB.Close()

	// Wire repositories
	charRepo   := repository.NewCharacterRepo(database.DB)
	combatRepo := repository.NewCombatRepo(database.DB)

	r := gin.New()
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	// CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "ok",
			"timestamp": time.Now().UTC(),
		})
	})

	// Wire dependencies
	engine  := combat.NewEngine()
	handler := api.NewHandler(engine, charRepo, combatRepo)
	api.RegisterRoutes(r, handler)

	log.Printf("🗡️  Anime Platform API listening on :%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("server error: %v", err)
	}
}