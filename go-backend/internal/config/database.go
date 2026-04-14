package config

import (
	"database/sql"
	"fmt"
	"os"
	"strings"
	"time"

	_ "github.com/go-sql-driver/mysql"
	_ "github.com/mattn/go-sqlite3"
)

// DatabaseConfig holds database connection settings
type DatabaseConfig struct {
	Driver          string // "mysql" or "sqlite"
	Host            string
	Port            string
	Name            string
	User            string
	Password        string
	SQLitePath      string
	MaxOpenConns    int
	MaxIdleConns    int
	ConnMaxLifetime time.Duration
	ConnMaxIdleTime time.Duration
}

// NewDatabaseConfig creates DatabaseConfig from environment
func NewDatabaseConfig() DatabaseConfig {
	driver := firstNonEmpty(strings.TrimSpace(os.Getenv("DB_CONNECTION")), strings.TrimSpace(os.Getenv("GO_DATABASE_DRIVER")))
	if driver == "" {
		driver = "sqlite"
	}

	return DatabaseConfig{
		Driver:          driver,
		Host:            firstNonEmpty(os.Getenv("GO_DATABASE_HOST"), os.Getenv("DB_HOST")),
		Port:            firstNonEmpty(os.Getenv("GO_DATABASE_PORT"), os.Getenv("DB_PORT")),
		Name:            firstNonEmpty(os.Getenv("GO_DATABASE_NAME"), os.Getenv("DB_DATABASE")),
		User:            firstNonEmpty(os.Getenv("GO_DATABASE_USER"), os.Getenv("DB_USERNAME")),
		Password:        firstNonEmpty(os.Getenv("GO_DATABASE_PASSWORD"), os.Getenv("DB_PASSWORD")),
		SQLitePath:      firstNonEmpty(os.Getenv("GO_DATABASE_SQLITE_PATH"), os.Getenv("DB_DATABASE")),
		MaxOpenConns:    5,
		MaxIdleConns:    2,
		ConnMaxLifetime: time.Hour,
		ConnMaxIdleTime: time.Minute * 10,
	}
}

// BuildDSN constructs the database connection string
func (c DatabaseConfig) BuildDSN() (string, error) {
	switch c.Driver {
	case "sqlite":
		if c.SQLitePath == "" {
			c.SQLitePath = "./data/posbengkel.db"
		}
		return c.SQLitePath, nil

	case "mysql":
		if c.Host == "" {
			c.Host = "127.0.0.1"
		}
		if c.Port == "" {
			c.Port = "3306"
		}
		if c.Name == "" {
			c.Name = "laravel12_pos_bengkel"
		}

		// MySQL DSN format: user:password@tcp(host:port)/dbname?param=value
		dsn := fmt.Sprintf(
			"%s:%s@tcp(%s:%s)/%s?parseTime=true&loc=Local",
			c.User,
			c.Password,
			c.Host,
			c.Port,
			c.Name,
		)
		return dsn, nil

	default:
		return "", fmt.Errorf("unsupported database driver: %s", c.Driver)
	}
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if strings.TrimSpace(value) != "" {
			return strings.TrimSpace(value)
		}
	}
	return ""
}

// InitDatabase opens database connection and validates it
func (c DatabaseConfig) InitDatabase() (*sql.DB, error) {
	dsn, err := c.BuildDSN()
	if err != nil {
		return nil, err
	}

	sqlDriver := c.Driver
	if c.Driver == "sqlite" {
		sqlDriver = "sqlite3"
	}

	db, err := sql.Open(sqlDriver, dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Set connection pool limits
	// SQLite: use single writer (MaxOpenConns=1)
	// MySQL: use higher concurrency
	if c.Driver == "sqlite" {
		db.SetMaxOpenConns(1)
		db.SetMaxIdleConns(1)
	} else {
		db.SetMaxOpenConns(c.MaxOpenConns)
		db.SetMaxIdleConns(c.MaxIdleConns)
	}

	db.SetConnMaxLifetime(c.ConnMaxLifetime)
	db.SetConnMaxIdleTime(c.ConnMaxIdleTime)

	// Test connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	// Enable foreign keys for SQLite
	if c.Driver == "sqlite" {
		if _, err := db.Exec("PRAGMA foreign_keys = ON"); err != nil {
			return nil, fmt.Errorf("failed to enable sqlite foreign keys: %w", err)
		}
	}

	return db, nil
}

// MustInitDatabase wraps InitDatabase and panics on error
func (c DatabaseConfig) MustInitDatabase() *sql.DB {
	db, err := c.InitDatabase()
	if err != nil {
		panic(fmt.Sprintf("Failed to initialize database: %v", err))
	}
	return db
}
