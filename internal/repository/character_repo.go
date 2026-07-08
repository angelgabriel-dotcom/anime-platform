package repository

import (
	"database/sql"
	"fmt"

	"github.com/yourname/anime-platform/internal/models"
)

type CharacterRepo struct {
	db *sql.DB
}

func NewCharacterRepo(db *sql.DB) *CharacterRepo {
	return &CharacterRepo{db: db}
}

// GetByID fetches a single character with all abilities.
func (r *CharacterRepo) GetByID(id string) (*models.Character, error) {
	row := r.db.QueryRow(`
		SELECT id,name,series,tier,
		       strength,speed,defense,intelligence,endurance,aura,
		       critical_rate,evasion_rate
		FROM characters WHERE id = ?`, id)

	c := &models.Character{}
	err := row.Scan(
		&c.ID, &c.Name, &c.Series, &c.Tier,
		&c.PowerAttributes.Strength,
		&c.PowerAttributes.Speed,
		&c.PowerAttributes.Defense,
		&c.PowerAttributes.Intelligence,
		&c.PowerAttributes.Endurance,
		&c.PowerAttributes.Aura,
		&c.PowerAttributes.CriticalRate,
		&c.PowerAttributes.EvasionRate,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("get character: %w", err)
	}

	// Load abilities
	abilities, err := r.getAbilities(id)
	if err != nil {
		return nil, err
	}
	c.SpecialAbilities = abilities
	return c, nil
}

// List returns all characters with abilities.
func (r *CharacterRepo) List() ([]*models.Character, error) {
	rows, err := r.db.Query(`
		SELECT id,name,series,tier,
		       strength,speed,defense,intelligence,endurance,aura,
		       critical_rate,evasion_rate
		FROM characters ORDER BY (strength+speed+defense+intelligence+endurance+aura) DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var chars []*models.Character
	for rows.Next() {
		c := &models.Character{}
		err := rows.Scan(
			&c.ID, &c.Name, &c.Series, &c.Tier,
			&c.PowerAttributes.Strength,
			&c.PowerAttributes.Speed,
			&c.PowerAttributes.Defense,
			&c.PowerAttributes.Intelligence,
			&c.PowerAttributes.Endurance,
			&c.PowerAttributes.Aura,
			&c.PowerAttributes.CriticalRate,
			&c.PowerAttributes.EvasionRate,
		)
		if err != nil {
			return nil, err
		}
		abilities, err := r.getAbilities(c.ID)
		if err != nil {
			return nil, err
		}
		c.SpecialAbilities = abilities
		chars = append(chars, c)
	}
	return chars, nil
}

func (r *CharacterRepo) getAbilities(charID string) ([]models.SpecialAbility, error) {
	rows, err := r.db.Query(`
		SELECT id,character_id,name,description,
		       mana_cost,stamina_cost,damage_multi,cooldown_turns,ability_type
		FROM special_abilities WHERE character_id = ?`, charID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var abilities []models.SpecialAbility
	for rows.Next() {
		ab := models.SpecialAbility{}
		err := rows.Scan(
			&ab.ID, &ab.CharacterID, &ab.Name, &ab.Description,
			&ab.ManaCost, &ab.StaminaCost, &ab.DamageMulti,
			&ab.CooldownTurns, &ab.AbilityType,
		)
		if err != nil {
			return nil, err
		}
		abilities = append(abilities, ab)
	}
	return abilities, nil
}