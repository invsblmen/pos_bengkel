package config

import (
	"path/filepath"
	"testing"
)

func TestDatabaseConfigBuildDSNSQLiteDefaultPath(t *testing.T) {
	cfg := DatabaseConfig{Driver: "sqlite"}

	dsn, err := cfg.BuildDSN()
	if err != nil {
		t.Fatalf("BuildDSN returned error: %v", err)
	}

	if dsn != "./data/posbengkel.db" {
		t.Fatalf("unexpected sqlite default path: got %q", dsn)
	}
}

func TestDatabaseConfigBuildDSNSQLiteCustomPath(t *testing.T) {
	expected := "./tmp/test.db"
	cfg := DatabaseConfig{Driver: "sqlite", SQLitePath: expected}

	dsn, err := cfg.BuildDSN()
	if err != nil {
		t.Fatalf("BuildDSN returned error: %v", err)
	}

	if dsn != expected {
		t.Fatalf("unexpected sqlite custom path: got %q want %q", dsn, expected)
	}
}

func TestDatabaseConfigInitDatabaseSQLiteEnablesForeignKeys(t *testing.T) {
	dbPath := filepath.Join(t.TempDir(), "posbengkel_test.db")
	cfg := DatabaseConfig{Driver: "sqlite", SQLitePath: dbPath}

	db, err := cfg.InitDatabase()
	if err != nil {
		t.Fatalf("InitDatabase returned error: %v", err)
	}
	t.Cleanup(func() {
		_ = db.Close()
	})

	if db.Stats().MaxOpenConnections != 1 {
		t.Fatalf("sqlite max open conns should be 1, got %d", db.Stats().MaxOpenConnections)
	}

	if _, err := db.Exec(`
		CREATE TABLE parent (
			id INTEGER PRIMARY KEY
		);
	`); err != nil {
		t.Fatalf("failed to create parent table: %v", err)
	}

	if _, err := db.Exec(`
		CREATE TABLE child (
			id INTEGER PRIMARY KEY,
			parent_id INTEGER NOT NULL,
			FOREIGN KEY(parent_id) REFERENCES parent(id)
		);
	`); err != nil {
		t.Fatalf("failed to create child table: %v", err)
	}

	if _, err := db.Exec("INSERT INTO child (parent_id) VALUES (999)"); err == nil {
		t.Fatalf("expected foreign key constraint error, got nil")
	}
}
