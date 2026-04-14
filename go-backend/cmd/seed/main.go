package main

import (
	"database/sql"
	"flag"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	dbPath := flag.String("path", "./data/posbengkel.db", "SQLite database path")
	password := flag.String("password-plain", "password123", "Password for admin user")
	email := flag.String("email", "admin@bengkel.local", "Email for admin user")
	flag.Parse()

	var db *sql.DB
	var err error

	// Create data directory for SQLite
	dir := filepath.Dir(*dbPath)
	if err := createDir(dir); err != nil {
		log.Fatalf("Failed to create directory: %v", err)
	}

	// Connect to SQLite
	db, err = sql.Open("sqlite3", *dbPath)
	if err != nil {
		log.Fatalf("Failed to open SQLite database: %v", err)
	}
	defer db.Close()

	// Load schema migration
	schema, err := ioutil.ReadFile("migrations/001_init_sqlite.sql")
	if err != nil {
		log.Fatalf("Failed to read migration file: %v", err)
	}

	if _, err := db.Exec(string(schema)); err != nil {
		log.Printf("⚠ Schema might already exist (that's OK): %v", err)
	} else {
		log.Println("✓ Schema loaded successfully")
	}

	// Enable foreign keys and performance pragmas in SQLite
	pragmas := []string{
		"PRAGMA foreign_keys = ON",
		"PRAGMA journal_mode = WAL",
		"PRAGMA synchronous = NORMAL",
		"PRAGMA temp_store = MEMORY",
		"PRAGMA busy_timeout = 5000",
	}
	for _, pragma := range pragmas {
		if _, err := db.Exec(pragma); err != nil {
			log.Fatalf("Failed to apply pragma %q: %v", pragma, err)
		}
	}
	log.Println("✓ SQLite pragmas enabled")

	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}
	log.Println("✓ Connected to database")

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(*password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Failed to hash password: %v", err)
	}

	// Insert admin user (ignore if already exists)
	insertUserSQL := `INSERT OR IGNORE INTO users (id, email, password_hash, name, phone, avatar, is_active, created_at, updated_at) 
		VALUES (1, ?, ?, 'Admin User', '08123456789', '', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`

	result, err := db.Exec(insertUserSQL, *email, string(hashedPassword))
	if err != nil {
		log.Fatalf("Failed to insert admin user: %v", err)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected > 0 {
		log.Printf("✓ Created admin user: %s (password: %s)", *email, *password)
	} else {
		log.Printf("⚠ Admin user already exists: %s", *email)
	}

	// Assign admin role in the SQLite RBAC table
	insertRoleSQL := `INSERT OR IGNORE INTO user_roles (user_id, role) VALUES (1, 'admin')`

	_, err = db.Exec(insertRoleSQL)
	if err != nil {
		log.Fatalf("Failed to assign admin role: %v", err)
	}
	log.Println("✓ Admin role assigned")

	log.Println("\n✓ Setup complete!")
	log.Printf("\nLogin with:\n  Email: %s\n  Password: %s\n", *email, *password)
	log.Printf("Database: %s\n", *dbPath)
}

func createDir(dir string) error {
	if dir == "" || dir == "." {
		return nil
	}
	return os.MkdirAll(dir, 0755)
}
