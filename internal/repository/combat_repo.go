package repository

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/yourname/anime-platform/internal/models"
)

type CombatRepo struct {
	db *sql.DB
}

func NewCombatRepo(db *sql.DB) *CombatRepo {
	return &CombatRepo{db: db}
}

// Save persists a full combat log to the database.
func (r *CombatRepo) Save(log *models.CombatLog) error {
	tx, err := r.db.Begin()
	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback()

	// Insert combat log header
	_, err = tx.Exec(`
		INSERT INTO combat_logs
		(id,challenger_id,opponent_id,winner_id,mode,total_rounds,duration_ms,created_at)
		VALUES (?,?,?,?,?,?,?,?)`,
		log.ID, log.ChallengerID, log.OpponentID, log.WinnerID,
		log.Mode, log.TotalRounds, log.DurationMS,
		log.CreatedAt.Format(time.RFC3339),
	)
	if err != nil {
		return fmt.Errorf("insert combat log: %w", err)
	}

	// Insert round logs
	for _, round := range log.Rounds {
		_, err = tx.Exec(`
			INSERT INTO round_logs
			(combat_id,round,actor_id,target_id,event_type,ability_used,damage,actor_hp,target_hp,narrative)
			VALUES (?,?,?,?,?,?,?,?,?,?)`,
			log.ID, round.Round, round.ActorID, round.TargetID,
			round.EventType, round.AbilityUsed, round.Damage,
			round.ActorHP, round.TargetHP, round.Narrative,
		)
		if err != nil {
			return fmt.Errorf("insert round log: %w", err)
		}
	}

	return tx.Commit()
}

// GetLeaderboard returns characters ranked by win rate.
func (r *CombatRepo) GetLeaderboard() ([]models.LeaderboardEntry, error) {
	rows, err := r.db.Query(`
		SELECT
			c.id, c.name, c.series, c.tier,
			c.strength, c.speed, c.defense, c.intelligence,
			c.endurance, c.aura, c.critical_rate, c.evasion_rate,
			COUNT(cl.id) as total_battles,
			SUM(CASE WHEN cl.winner_id = c.id THEN 1 ELSE 0 END) as wins
		FROM characters c
		LEFT JOIN combat_logs cl
			ON cl.challenger_id = c.id OR cl.opponent_id = c.id
		GROUP BY c.id
		ORDER BY
			CASE WHEN COUNT(cl.id) > 0
				THEN CAST(SUM(CASE WHEN cl.winner_id = c.id THEN 1 ELSE 0 END) AS REAL) / COUNT(cl.id)
				ELSE 0
			END DESC,
			(c.strength + c.speed + c.defense + c.intelligence + c.endurance + c.aura) DESC
	`)
	if err != nil {
		return nil, fmt.Errorf("leaderboard query: %w", err)
	}
	defer rows.Close()

	var entries []models.LeaderboardEntry
	rank := 1
	for rows.Next() {
		c := &models.Character{}
		var totalBattles, wins int
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
			&totalBattles, &wins,
		)
		if err != nil {
			return nil, err
		}

		winRate := 0.0
		if totalBattles > 0 {
			winRate = float64(wins) / float64(totalBattles)
		}

		entries = append(entries, models.LeaderboardEntry{
			Rank:         rank,
			Character:    c,
			PowerTotal:   c.PowerAttributes.PowerTotal(),
			WinRate:      winRate,
			TotalBattles: totalBattles,
		})
		rank++
	}
	return entries, nil
}

// GetByID fetches a single combat log with all rounds.
func (r *CombatRepo) GetByID(id string) (*models.CombatLog, error) {
	row := r.db.QueryRow(`
		SELECT id,challenger_id,opponent_id,winner_id,mode,total_rounds,duration_ms,created_at
		FROM combat_logs WHERE id = ?`, id)

	log := &models.CombatLog{}
	var createdAt string
	err := row.Scan(
		&log.ID, &log.ChallengerID, &log.OpponentID,
		&log.WinnerID, &log.Mode, &log.TotalRounds,
		&log.DurationMS, &createdAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	log.CreatedAt, _ = time.Parse(time.RFC3339, createdAt)
	return log, nil
}