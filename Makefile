# ─── Anime Platform Makefile ──────────────────────────────────────────────────
# Run `make help` to see all available commands

.PHONY: help dev build test clean docker-up docker-down docker-reset \
        migrate seed fmt vet storyboard model-review

# ── Variables ─────────────────────────────────────────────────────────────────
BINARY_NAME = anime-platform
BUILD_DIR   = ./bin
GO_CMD      = go
MAIN_PATH   = ./cmd/server/main.go

# ── Help ──────────────────────────────────────────────────────────────────────
help:
	@echo ""
	@echo "  🗡️  Anime Platform — Available Commands"
	@echo "  ────────────────────────────────────────"
	@echo "  make dev          → run backend in dev mode (hot reload)"
	@echo "  make storyboard   → serve the Jin-Woo creative review at localhost:4175"
	@echo "  make model-review → inspect the local Jin-Woo model at localhost:4176/review.html"
	@echo "  make build        → compile Go binary to ./bin/"
	@echo "  make test         → run all Go tests"
	@echo "  make fmt          → format all Go code"
	@echo "  make vet          → check for Go code issues"
	@echo "  make docker-up    → start all services (db + backend + frontend)"
	@echo "  make docker-down  → stop all services"
	@echo "  make docker-reset → stop all + wipe database volume"
	@echo "  make migrate      → run SQL migrations manually"
	@echo "  make seed         → seed the database with sample characters"
	@echo "  make clean        → remove build artifacts"
	@echo ""

# ── Development ───────────────────────────────────────────────────────────────
storyboard:
	python3 -m http.server 4175 --bind 127.0.0.1 --directory docs/creative/jinwoo

model-review:
	python3 -m http.server 4176 --bind 127.0.0.1 --directory assets/incoming/jinwoo/generated

dev:
	@echo "🚀 Starting backend in dev mode..."
	GIN_MODE=debug $(GO_CMD) run $(MAIN_PATH)

build:
	@echo "🔨 Building binary..."
	@mkdir -p $(BUILD_DIR)
	$(GO_CMD) build -ldflags="-w -s" -o $(BUILD_DIR)/$(BINARY_NAME) $(MAIN_PATH)
	@echo "✅ Binary built at $(BUILD_DIR)/$(BINARY_NAME)"

test:
	@echo "🧪 Running tests..."
	$(GO_CMD) test ./... -v -cover

fmt:
	@echo "✨ Formatting Go code..."
	$(GO_CMD) fmt ./...

vet:
	@echo "🔍 Vetting Go code..."
	$(GO_CMD) vet ./...

clean:
	@echo "🧹 Cleaning build artifacts..."
	@rm -rf $(BUILD_DIR)
	@echo "✅ Done"

# ── Docker ────────────────────────────────────────────────────────────────────
docker-up:
	@echo "🐳 Starting all services..."
	docker compose up --build

docker-down:
	@echo "🛑 Stopping all services..."
	docker compose down

docker-reset:
	@echo "⚠️  Stopping all services and wiping database..."
	docker compose down -v
	@echo "✅ Database wiped"

# ── Database ──────────────────────────────────────────────────────────────────
migrate:
	@echo "📦 Running migrations..."
	@export $(shell cat .env | xargs) && \
	psql "postgres://$$DB_USER:$$DB_PASSWORD@$$DB_HOST:$$DB_PORT/$$DB_NAME" \
		-f migrations/001_create_characters.sql \
		-f migrations/002_create_combat_logs.sql
	@echo "✅ Migrations complete"

seed:
	@echo "🌱 Seeding database with sample characters..."
	$(GO_CMD) run scripts/seed.go
	@echo "✅ Seed complete"
