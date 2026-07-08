package models

import "time"

// EventType classifies what happened in a combat event for frontend rendering.
type EventType string

const (
	EventNormalAttack  EventType = "NORMAL_ATTACK"
	EventSpecialSkill  EventType = "SPECIAL_SKILL"
	EventCriticalHit   EventType = "CRITICAL_HIT"
	EventEvaded        EventType = "EVADED"
	EventBuff          EventType = "BUFF"
	EventDebuff        EventType = "DEBUFF"
	EventHeal          EventType = "HEAL"
	EventKO            EventType = "KNOCKOUT"
	EventManaExhausted EventType = "MANA_EXHAUSTED"
)

// RoundLog captures every event that occurred within a single turn.
type RoundLog struct {
	Round       int         `json:"round"`
	ActorID     string      `json:"actor_id"`
	TargetID    string      `json:"target_id"`
	EventType   EventType   `json:"event_type"`
	AbilityUsed string      `json:"ability_used,omitempty"`
	Damage      int         `json:"damage"`
	ManaDelta   int         `json:"mana_delta"`   // negative = cost, positive = regen
	StaminaDelta int        `json:"stamina_delta"`
	ActorHP     int         `json:"actor_hp"`
	TargetHP    int         `json:"target_hp"`
	ActorMana   int         `json:"actor_mana"`
	TargetMana  int         `json:"target_mana"`
	Narrative   string      `json:"narrative"`    // flavour text for the UI
	Timestamp   time.Time   `json:"timestamp"`
}

// CombatLog is the persisted record of a completed battle.
type CombatLog struct {
	ID           string      `json:"id"           db:"id"`
	ChallengerID string      `json:"challenger_id" db:"challenger_id"`
	OpponentID   string      `json:"opponent_id"  db:"opponent_id"`
	WinnerID     string      `json:"winner_id"    db:"winner_id"`
	Mode         string      `json:"mode"         db:"mode"`
	TotalRounds  int         `json:"total_rounds" db:"total_rounds"`
	Rounds       []RoundLog  `json:"rounds"       db:"-"` // stored as JSONB
	DurationMS   float64     `json:"duration_ms"  db:"duration_ms"`
	CreatedAt    time.Time   `json:"created_at"   db:"created_at"`
}
