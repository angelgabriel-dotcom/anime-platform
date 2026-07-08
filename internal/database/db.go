// Package database handles SQLite connection, schema migration,
// and seed data for the anime platform.
package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/mattn/go-sqlite3"
)

// DB is the global database connection pool.
var DB *sql.DB

// Init opens the SQLite database, runs migrations, and seeds characters.
func Init(dataDir string) error {
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		return fmt.Errorf("create data dir: %w", err)
	}

	dbPath := dataDir + "/anime.db"
	db, err := sql.Open("sqlite3", dbPath+"?_foreign_keys=on&_journal_mode=WAL&_busy_timeout=5000")
	if err != nil {
		return fmt.Errorf("open sqlite: %w", err)
	}

	db.SetMaxOpenConns(1)
	db.SetMaxIdleConns(1)
	db.SetConnMaxLifetime(0)
	DB = db

	// Ping to verify connection
	if err := db.Ping(); err != nil {
		return fmt.Errorf("ping db: %w", err)
	}

	if err := migrate(db); err != nil {
		return fmt.Errorf("migrate: %w", err)
	}

	if err := seed(db); err != nil {
		return fmt.Errorf("seed: %w", err)
	}

	log.Println("✅ Database ready at", dbPath)
	return nil
}

// migrate creates all tables if they don't exist.
func migrate(db *sql.DB) error {
	schema := `
	CREATE TABLE IF NOT EXISTS characters (
		id              TEXT PRIMARY KEY,
		name            TEXT NOT NULL,
		series          TEXT NOT NULL,
		tier            TEXT NOT NULL,
		image_url       TEXT DEFAULT '',
		lore            TEXT DEFAULT '',
		strength        INTEGER NOT NULL DEFAULT 0,
		speed           INTEGER NOT NULL DEFAULT 0,
		defense         INTEGER NOT NULL DEFAULT 0,
		intelligence    INTEGER NOT NULL DEFAULT 0,
		endurance       INTEGER NOT NULL DEFAULT 0,
		aura            INTEGER NOT NULL DEFAULT 0,
		critical_rate   INTEGER NOT NULL DEFAULT 0,
		evasion_rate    INTEGER NOT NULL DEFAULT 0,
		created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS special_abilities (
		id              TEXT PRIMARY KEY,
		character_id    TEXT NOT NULL REFERENCES characters(id),
		name            TEXT NOT NULL,
		description     TEXT DEFAULT '',
		mana_cost       INTEGER NOT NULL DEFAULT 0,
		stamina_cost    INTEGER NOT NULL DEFAULT 0,
		damage_multi    REAL NOT NULL DEFAULT 1.0,
		cooldown_turns  INTEGER NOT NULL DEFAULT 0,
		ability_type    TEXT DEFAULT 'attack'
	);

	CREATE TABLE IF NOT EXISTS combat_logs (
		id              TEXT PRIMARY KEY,
		challenger_id   TEXT NOT NULL REFERENCES characters(id),
		opponent_id     TEXT NOT NULL REFERENCES characters(id),
		winner_id       TEXT NOT NULL,
		mode            TEXT NOT NULL DEFAULT 'quick',
		total_rounds    INTEGER NOT NULL DEFAULT 0,
		duration_ms     REAL NOT NULL DEFAULT 0,
		created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS round_logs (
		id              INTEGER PRIMARY KEY AUTOINCREMENT,
		combat_id       TEXT NOT NULL REFERENCES combat_logs(id),
		round           INTEGER NOT NULL,
		actor_id        TEXT NOT NULL,
		target_id       TEXT NOT NULL,
		event_type      TEXT NOT NULL,
		ability_used    TEXT DEFAULT '',
		damage          INTEGER NOT NULL DEFAULT 0,
		actor_hp        INTEGER NOT NULL DEFAULT 0,
		target_hp       INTEGER NOT NULL DEFAULT 0,
		narrative       TEXT DEFAULT ''
	);

	CREATE INDEX IF NOT EXISTS idx_combat_challenger ON combat_logs(challenger_id);
	CREATE INDEX IF NOT EXISTS idx_combat_opponent   ON combat_logs(opponent_id);
	CREATE INDEX IF NOT EXISTS idx_combat_winner     ON combat_logs(winner_id);
	CREATE INDEX IF NOT EXISTS idx_rounds_combat     ON round_logs(combat_id);
	`

	_, err := db.Exec(schema)
	return err
}

// seed inserts all 6 characters if they don't already exist.
func seed(db *sql.DB) error {
	type ability struct {
		id, name, desc, abilityType string
		mana, stamina, cooldown     int
		multi                       float64
	}
	type character struct {
		id, name, series, tier string
		str, spd, def, intel   int
		end, aura              int
		crit, evasion          int
		abilities              []ability
	}

	characters := []character{
		{
			id: "sung-jinwoo", name: "Sung Jin-Woo", series: "Solo Leveling", tier: "GOD",
			str: 9800, spd: 9700, def: 8500, intel: 8000, end: 9000, aura: 9500,
			crit: 75, evasion: 60,
			abilities: []ability{
				{"ruler-authority", "Ruler's Authority", "Commands shadows to assail the enemy", "attack", 500, 100, 3, 3.5},
				{"shadow-exchange", "Shadow Exchange", "Switches place with a shadow soldier", "attack", 200, 50, 1, 1.8},
			},
		},
		{
			id: "gojo-satoru", name: "Gojo Satoru", series: "Jujutsu Kaisen", tier: "GOD",
			str: 9200, spd: 9500, def: 9900, intel: 9800, end: 9000, aura: 9800,
			crit: 55, evasion: 80,
			abilities: []ability{
				{"infinity", "Infinity", "Passive barrier reducing all damage", "passive", 0, 0, 0, 0},
				{"hollow-purple", "Hollow Purple", "Convergence of Red and Blue", "attack", 800, 200, 5, 5.0},
			},
		},
		{
			id: "zoro", name: "Roronoa Zoro", series: "One Piece", tier: "S",
			str: 8350, spd: 8000, def: 8300, intel: 7000, end: 9500, aura: 8000,
			crit: 80, evasion: 55,
			abilities: []ability{
				{"ackermann-burst", "Conqueror's Haki", "Dark manifestation of spiritual willpower", "passive", 0, 0, 0, 0},
				{"the-breath-of-all-things", "Breath of All Things", "The absolute pinnacle of swordsmanship", "attack", 700, 250, 4, 4.5},
			},
		},
		{
			id: "madara", name: "Madara Uchiha", series: "Naruto", tier: "S",
			str: 9600, spd: 9200, def: 8500, intel: 9700, end: 9500, aura: 8000,
			crit: 80, evasion: 60,
			abilities: []ability{
				{"susanoo", "Perfect Susanoo", "The visual prowess of the Uchiha", "attack", 500, 300, 3, 3.8},
				{"limbo", "Limbo: Border Jail", "Projects corporeal shadows", "attack", 700, 250, 4, 4.5},
			},
		},
		{
			id: "levi", name: "Levi Ackermann", series: "Attack on Titan", tier: "A",
			str: 8500, spd: 9000, def: 7500, intel: 8800, end: 8200, aura: 7000,
			crit: 85, evasion: 90,
			abilities: []ability{
				{"ackermann-burst", "Ackermann Burst", "Ackermann instinct awakening", "attack", 200, 500, 2, 3.0},
				{"vertical-slash", "360° Vertical Slash", "Human buzzsaw maneuver", "attack", 100, 350, 1, 2.0},
			},
		},
		{
			id: "ichigo", name: "Ichigo Kurosaki", series: "Bleach", tier: "S",
			str: 9300, spd: 9400, def: 8000, intel: 7800, end: 9500, aura: 9200,
			crit: 60, evasion: 62,
			abilities: []ability{
				{"getsuga-tensho", "Getsuga Tenshō", "Moon Fang Heaven-Piercer", "attack", 300, 700, 2, 2.8},
				{"final-getsuga", "Mugetsu", "The moonless sky", "attack", 999, 750, 9, 6.0},
			},
		},
	}

	for _, c := range characters {
		// Insert character if not exists
		_, err := db.Exec(`
			INSERT OR IGNORE INTO characters
			(id,name,series,tier,strength,speed,defense,intelligence,endurance,aura,critical_rate,evasion_rate)
			VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
			c.id, c.name, c.series, c.tier,
			c.str, c.spd, c.def, c.intel, c.end, c.aura, c.crit, c.evasion,
		)
		if err != nil {
			return fmt.Errorf("seed character %s: %w", c.id, err)
		}

		// Insert abilities
		for _, ab := range c.abilities {
			_, err := db.Exec(`
				INSERT OR IGNORE INTO special_abilities
				(id,character_id,name,description,mana_cost,stamina_cost,damage_multi,cooldown_turns,ability_type)
				VALUES (?,?,?,?,?,?,?,?,?)`,
				ab.id, c.id, ab.name, ab.desc,
				ab.mana, ab.stamina, ab.multi, ab.cooldown, ab.abilityType,
			)
			if err != nil {
				return fmt.Errorf("seed ability %s: %w", ab.id, err)
			}
		}
	}

	log.Println("✅ Characters seeded")
	return nil
}
