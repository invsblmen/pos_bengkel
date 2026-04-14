package main

import (
	"database/sql"
	"flag"
	"fmt"
	"log"

	_ "github.com/go-sql-driver/mysql"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	dbHost := flag.String("host", "127.0.0.1", "Database host")
	dbPort := flag.String("port", "3306", "Database port")
	dbName := flag.String("database", "laravel12_pos_bengkel", "Database name")
	dbUser := flag.String("user", "root", "Database user")
	dbPassword := flag.String("password", "root", "Database password")
	password := flag.String("password-plain", "password123", "Password for admin user")
	email := flag.String("email", "admin@bengkel.local", "Email for admin user")
	flag.Parse()

	// Connect to MySQL
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true&loc=Local",
		*dbUser, *dbPassword, *dbHost, *dbPort, *dbName)
	
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v\n\nMake sure MySQL is running and database '%s' exists.", err, *dbName)
	}

	log.Println("✓ Connected to database")

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(*password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Failed to hash password: %v", err)
	}

	// Insert admin user
	insertUserSQL := `INSERT IGNORE INTO users (id, email, password_hash, name, phone, avatar, is_active, created_at, updated_at) 
		VALUES (1, ?, ?, 'Admin User', '08123456789', '', 1, NOW(), NOW())`
	
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

	// Insert admin role if not exists
	insertRoleSQL := `INSERT IGNORE INTO roles (id, name) VALUES (1, 'admin')`
	_, err = db.Exec(insertRoleSQL)
	if err != nil {
		log.Fatalf("Failed to insert admin role: %v", err)
	}
	log.Println("✓ Admin role ready")

	// Assign role to user
	insertUserRoleSQL := `INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (1, 1)`
	_, err = db.Exec(insertUserRoleSQL)
	if err != nil {
		log.Fatalf("Failed to assign role to user: %v", err)
	}
	log.Println("✓ Role assigned to user")

	log.Println("\n✓ Setup complete!")
	log.Printf("\nLogin with:\n  Email: %s\n  Password: %s", *email, *password)
}
