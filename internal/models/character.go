package models

import (
	"time"

	"github.com/lib/pq"
)

// Tier represents a character's power classification
type Tier string

const (
	TierS    Tier = "S"
	TierA    Tier = "A"
	TierB    Tier = "B"
	TierC    Tier = "C"
	TierGod  Tier = "GOD"
)

// PowerAttributes holds all numerical combat statistics for a character.
// Every field is scaled 0–10000 to allow fine-grained balancing.
type PowerAttributes struct {
	Strength      int `json:"strength"       db:"strength"`       // Raw physical damage output
	Speed         int `json:"speed"          db:"speed"`           // Determines turn order & dodge chance
	Defense       int `json:"defense"        db:"defense"`         // Damage mitigation flat value
	Intelligence  int `json:"intelligence"   db:"intelligence"`    // Amplifies skill damage & debuff success
	Endurance     int `json:"endurance"      db:"endurance"`       // Max HP multiplier base
	Aura          int `json:"aura"           db:"aura"`            // Mana/Ki pool size
	CriticalRate  int `json:"critical_rate"  db:"critical_rate"`  // % chance 0–100
	EvasionRate   int `json:"evasion_rate"   db:"evasion_rate"`   // % chance 0–100
}

// PowerTotal computes a single comparable score for ranking purposes.
func (p PowerAttributes) PowerTotal() int {
	return p.Strength + p.Speed + p.Defense + p.Intelligence +
		p.Endurance + p.Aura + p.CriticalRate*10 + p.EvasionRate*5
}

// SpecialAbility defines a unique skill a character can activate during combat.
type SpecialAbility struct {
	ID          string  `json:"id"           db:"id"`
	CharacterID string  `json:"character_id" db:"character_id"`
	Name        string  `json:"name"         db:"name"`
	Description string  `json:"description"  db:"description"`
	ManaCost    int     `json:"mana_cost"    db:"mana_cost"`    // Deducted from Aura pool
	StaminaCost int     `json:"stamina_cost" db:"stamina_cost"` // Deducted from Endurance pool
	DamageMulti float64 `json:"damage_multi" db:"damage_multi"` // e.g. 2.5 = 250% of base attack
	CooldownTurns int  `json:"cooldown_turns" db:"cooldown_turns"`
	AbilityType string  `json:"ability_type" db:"ability_type"` // "attack" | "buff" | "debuff" | "heal"
}

// Character is the primary entity representing a fighter.
type Character struct {
	ID              string          `json:"id"              db:"id"`
	Name            string          `json:"name"            db:"name"`
	Series          string          `json:"series"          db:"series"`
	ImageURL        string          `json:"image_url"       db:"image_url"`
	Tier            Tier            `json:"tier"            db:"tier"`
	PowerAttributes PowerAttributes `json:"power_attributes" db:"power_attributes"`
	SpecialAbilities []SpecialAbility `json:"special_abilities" db:"-"` // loaded via JOIN
	Tags            pq.StringArray  `json:"tags"            db:"tags"` // e.g. ["undead","sword","solo-leveling"]
	Lore            string          `json:"lore"            db:"lore"`
	CreatedAt       time.Time       `json:"created_at"      db:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at"      db:"updated_at"`
}

// --- Request/Response DTOs ---

type BattleRequest struct {
	Challenger string `json:"challenger_id" binding:"required"`
	Opponent   string `json:"opponent_id"   binding:"required"`
	Mode       string `json:"mode"          binding:"required,oneof=quick ranked story"`
}

type BattleResponse struct {
	BattleID  string      `json:"battle_id"`
	Winner    *Character  `json:"winner"`
	Loser     *Character  `json:"loser"`
	Rounds    []RoundLog  `json:"rounds"`
	Duration  float64     `json:"duration_ms"`
	CreatedAt time.Time   `json:"created_at"`
}

type LeaderboardEntry struct {
	Rank        int        `json:"rank"`
	Character   *Character `json:"character"`
	PowerTotal  int        `json:"power_total"`
	WinRate     float64    `json:"win_rate"`
	TotalBattles int       `json:"total_battles"`
}
