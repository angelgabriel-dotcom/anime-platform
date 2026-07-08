// Package combat implements the server-side battle simulation engine.
// It is intentionally decoupled from HTTP concerns; it receives domain
// models, runs the fight, and returns a structured log.
package combat

import (
	"context"
	"fmt"
	"math"
	"math/rand"
	"sync"
	"time"

	"github.com/google/uuid"

	"github.com/yourname/anime-platform/internal/models"
)

const (
	maxRounds       = 50  // safety cap — prevents infinite battles
	baseHPMulti     = 100 // HP = Endurance * baseHPMulti
	baseManaMulti   = 10  // Mana = Aura * baseManaMulti
	staminaPerRound = 5   // passive stamina drain every round
	manaRegenRate   = 3   // passive mana regen every round
)

// narrativeTemplates provides flavour text keyed by EventType.
var narrativeTemplates = map[models.EventType][]string{
	models.EventNormalAttack: {
		"%s unleashes a fierce strike on %s for %d damage!",
		"%s moves with blinding speed — %s takes %d damage!",
		"%s channels raw power into a crushing blow: %s takes %d damage!",
	},
	models.EventSpecialSkill: {
		"⚡ %s activates [%s]! A devastating wave of energy slams into %s for %d damage!",
		"💠 %s invokes the power of [%s] — reality bends as %s suffers %d damage!",
	},
	models.EventCriticalHit: {
		"🔥 CRITICAL! %s finds a weak point — %s reels from %d catastrophic damage!",
		"💥 %s's strike resonates with perfect timing — CRIT! %s reels from %d damage!",
	},
	models.EventEvaded: {
		"🌀 %s vanishes in a blur — %s's attack cuts through empty air!",
		"✨ %s sidesteps with supernatural grace, leaving %s grasping at shadows!",
	},
	models.EventKO: {
		"💀 %s has fallen. %s stands victorious amid the ruins of battle.",
		"👑 The aura fades from %s... %s claims dominance over this arena.",
	},
}

// combatant is an internal, mutable view of a character during a fight.
type combatant struct {
	char      *models.Character
	hp        int
	maxHP     int
	mana      int
	maxMana   int
	stamina   int
	cooldowns map[string]int // ability_id → rounds remaining
}

func newCombatant(c *models.Character) *combatant {
	hp := c.PowerAttributes.Endurance * baseHPMulti
	mana := c.PowerAttributes.Aura * baseManaMulti
	return &combatant{
		char:      c,
		hp:        hp,
		maxHP:     hp,
		mana:      mana,
		maxMana:   mana,
		stamina:   c.PowerAttributes.Endurance,
		cooldowns: make(map[string]int),
	}
}

func (cb *combatant) isAlive() bool   { return cb.hp > 0 }
func (cb *combatant) isDrained() bool { return cb.stamina <= 0 }

func (cb *combatant) tickCooldowns() {
	for id, turns := range cb.cooldowns {
		if turns > 0 {
			cb.cooldowns[id] = turns - 1
		}
	}
}

func (cb *combatant) regenPassive() {
	// Mana regenerates each round up to the cap
	cb.mana = min(cb.maxMana, cb.mana+manaRegenRate)
	// Stamina drains each round
	cb.stamina = max(0, cb.stamina-staminaPerRound)
}

// Engine is the stateless combat simulator. It is safe to use concurrently.
type Engine struct {
	rng *rand.Rand
	mu  sync.Mutex // guards rng access
}

// NewEngine returns a seeded Engine ready for use.
func NewEngine() *Engine {
	return &Engine{rng: rand.New(rand.NewSource(time.Now().UnixNano()))}
}

func (e *Engine) intn(n int) int {
	e.mu.Lock()
	defer e.mu.Unlock()
	return e.rng.Intn(n)
}

func (e *Engine) float64n() float64 {
	e.mu.Lock()
	defer e.mu.Unlock()
	return e.rng.Float64()
}

// Simulate runs a full battle between two characters and returns the complete log.
// The function is safe to call concurrently from multiple goroutines.
func (e *Engine) Simulate(
	ctx context.Context,
	challenger, opponent *models.Character,
	mode string,
) (*models.CombatLog, error) {

	start := time.Now()
	battleID := uuid.NewString()

	a := newCombatant(challenger)
	b := newCombatant(opponent)

	// Determine turn order: higher Speed goes first.
	// Ties broken by evasion rate.
	if b.char.PowerAttributes.Speed > a.char.PowerAttributes.Speed {
		a, b = b, a
	}

	var rounds []models.RoundLog
	var winnerID string

	for round := 1; round <= maxRounds; round++ {
		select {
		case <-ctx.Done():
			return nil, ctx.Err()
		default:
		}

		// Each round both combatants act (attacker then defender counter-attacks)
		for _, turn := range [][2]*combatant{{a, b}, {b, a}} {
			actor, target := turn[0], turn[1]

			if !actor.isAlive() || !target.isAlive() {
				break
			}

			actor.tickCooldowns()
			actor.regenPassive()

			log := e.resolveTurn(round, actor, target)
			rounds = append(rounds, log)

			if !target.isAlive() {
				// KO event
				rounds = append(rounds, models.RoundLog{
					Round:     round,
					ActorID:   actor.char.ID,
					TargetID:  target.char.ID,
					EventType: models.EventKO,
					Narrative: e.narrative(models.EventKO, actor.char.Name, target.char.Name, 0),
					ActorHP:   actor.hp,
					TargetHP:  0,
					Timestamp: time.Now(),
				})
				winnerID = actor.char.ID
				goto battleOver
			}
		}
	}

	// If we exhaust maxRounds, the character with more HP wins
	if a.hp >= b.hp {
		winnerID = a.char.ID
	} else {
		winnerID = b.char.ID
	}

battleOver:
	return &models.CombatLog{
		ID:           battleID,
		ChallengerID: challenger.ID,
		OpponentID:   opponent.ID,
		WinnerID:     winnerID,
		Mode:         mode,
		TotalRounds:  len(rounds),
		Rounds:       rounds,
		DurationMS:   float64(time.Since(start).Microseconds()) / 1000.0,
		CreatedAt:    time.Now(),
	}, nil
}

// resolveTurn calculates a single actor-attacks-target event.
func (e *Engine) resolveTurn(round int, actor, target *combatant) models.RoundLog {
	attrs := actor.char.PowerAttributes

	// Evasion check
	if e.intn(100) < target.char.PowerAttributes.EvasionRate {
		return models.RoundLog{
			Round:      round,
			ActorID:    actor.char.ID,
			TargetID:   target.char.ID,
			EventType:  models.EventEvaded,
			Damage:     0,
			ActorHP:    actor.hp,
			TargetHP:   target.hp,
			ActorMana:  actor.mana,
			TargetMana: target.mana,
			Narrative:  e.narrative(models.EventEvaded, target.char.Name, actor.char.Name, 0),
			Timestamp:  time.Now(),
		}
	}

	// Check if actor can use a special ability
	ability, canUse := e.selectAbility(actor)

	eventType := models.EventNormalAttack
	abilityName := ""
	manaDelta := 0
	staminaDelta := 0
	damageMulti := 1.0

	if canUse && ability != nil {
		// Deduct costs
		actor.mana -= ability.ManaCost
		actor.stamina -= ability.StaminaCost
		actor.cooldowns[ability.ID] = ability.CooldownTurns

		manaDelta = -ability.ManaCost
		staminaDelta = -ability.StaminaCost
		damageMulti = ability.DamageMulti
		abilityName = ability.Name
		eventType = models.EventSpecialSkill
	}

	// Base damage: Strength - target Defence (floored at 1)
	baseDamage := max(1, attrs.Strength-target.char.PowerAttributes.Defense)

	// Intelligence amplifies special abilities
	if eventType == models.EventSpecialSkill {
		intelligenceBonus := 1.0 + float64(attrs.Intelligence)/10000.0
		baseDamage = int(float64(baseDamage) * intelligenceBonus)
	}

	// Apply ability multiplier
	damage := int(math.Ceil(float64(baseDamage) * damageMulti))

	// Critical hit check
	if e.intn(100) < attrs.CriticalRate {
		damage = int(float64(damage) * 1.75)
		eventType = models.EventCriticalHit
	}

	// Stamina exhaustion debuffs damage
	if actor.isDrained() {
		damage = int(float64(damage) * 0.4)
	}

	target.hp = max(0, target.hp-damage)

	narrative := e.narrative(eventType, actor.char.Name, target.char.Name, damage)
	if eventType == models.EventSpecialSkill {
		narrative = e.narrativeSkill(actor.char.Name, abilityName, target.char.Name, damage)
	}

	return models.RoundLog{
		Round:        round,
		ActorID:      actor.char.ID,
		TargetID:     target.char.ID,
		EventType:    eventType,
		AbilityUsed:  abilityName,
		Damage:       damage,
		ManaDelta:    manaDelta,
		StaminaDelta: staminaDelta,
		ActorHP:      actor.hp,
		TargetHP:     target.hp,
		ActorMana:    actor.mana,
		TargetMana:   target.mana,
		Narrative:    narrative,
		Timestamp:    time.Now(),
	}
}

// selectAbility picks the best available ability the actor can afford.
// Returns nil if no ability is usable this turn.
func (e *Engine) selectAbility(actor *combatant) (*models.SpecialAbility, bool) {
	if len(actor.char.SpecialAbilities) == 0 {
		return nil, false
	}

	var usable []models.SpecialAbility
	for _, ab := range actor.char.SpecialAbilities {
		cd := actor.cooldowns[ab.ID]
		if cd == 0 && actor.mana >= ab.ManaCost && actor.stamina >= ab.StaminaCost {
			usable = append(usable, ab)
		}
	}

	if len(usable) == 0 {
		return nil, false
	}

	// 40% chance to use a special ability when one is available (prevents spam)
	if e.intn(100) >= 40 {
		return nil, false
	}

	chosen := usable[e.intn(len(usable))]
	return &chosen, true
}

func (e *Engine) narrative(et models.EventType, a, b string, dmg int) string {
	templates, ok := narrativeTemplates[et]
	if !ok || len(templates) == 0 {
		return fmt.Sprintf("%s attacks %s for %d damage.", a, b, dmg)
	}
	tpl := templates[e.intn(len(templates))]
	switch et {
	case models.EventEvaded:
		return fmt.Sprintf(tpl, b, a)
	case models.EventKO:
		return fmt.Sprintf(tpl, b, a)
	default:
		return fmt.Sprintf(tpl, a, b, dmg)
	}
}

func (e *Engine) narrativeSkill(actor, skill, target string, dmg int) string {
	templates := narrativeTemplates[models.EventSpecialSkill]
	tpl := templates[e.intn(len(templates))]
	return fmt.Sprintf(tpl, actor, skill, target, dmg)
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}
