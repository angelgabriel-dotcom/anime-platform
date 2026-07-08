# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM golang:1.22-alpine AS builder

# Install CA certs for HTTPS calls within the app
RUN apk add --no-cache ca-certificates git

WORKDIR /build

# Cache dependencies before copying source (layer-cache friendly)
COPY go.mod go.sum ./
RUN go mod download

# Copy source and compile
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-w -s" -o /anime-platform ./cmd/server

# ─── Stage 2: Minimal runtime image ───────────────────────────────────────────
FROM scratch

COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /anime-platform /anime-platform

# Non-root principle: scratch has no users, binary runs as PID 1
EXPOSE 8080

ENV GIN_MODE=release
ENV PORT=8080

ENTRYPOINT ["/anime-platform"]
