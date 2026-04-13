package services

import (
	"database/sql"
	"reflect"
	"testing"

	_ "github.com/mattn/go-sqlite3"
)

func setupAuthServiceTestDB(t *testing.T) *sql.DB {
	t.Helper()

	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatalf("open sqlite: %v", err)
	}

	t.Cleanup(func() {
		_ = db.Close()
	})

	return db
}

func execStatements(t *testing.T, db *sql.DB, statements []string) {
	t.Helper()

	for _, stmt := range statements {
		if _, err := db.Exec(stmt); err != nil {
			t.Fatalf("exec statement failed: %v\nstatement: %s", err, stmt)
		}
	}
}

func TestGetUserPermissions_ReturnsDirectAndRolePermissions(t *testing.T) {
	db := setupAuthServiceTestDB(t)
	execStatements(t, db, []string{
		`CREATE TABLE permissions (id INTEGER PRIMARY KEY, name TEXT NOT NULL);`,
		`CREATE TABLE roles (id INTEGER PRIMARY KEY, name TEXT NOT NULL);`,
		`CREATE TABLE model_has_permissions (permission_id INTEGER NOT NULL, model_id INTEGER NOT NULL);`,
		`CREATE TABLE model_has_roles (role_id INTEGER NOT NULL, model_id INTEGER NOT NULL);`,
		`CREATE TABLE role_has_permissions (permission_id INTEGER NOT NULL, role_id INTEGER NOT NULL);`,
		`INSERT INTO permissions (id, name) VALUES (1, 'service-orders-access');`,
		`INSERT INTO permissions (id, name) VALUES (2, 'reports-access');`,
		`INSERT INTO permissions (id, name) VALUES (3, 'users-access');`,
		`INSERT INTO roles (id, name) VALUES (10, 'admin');`,
		`INSERT INTO model_has_permissions (permission_id, model_id) VALUES (1, 99);`,
		`INSERT INTO model_has_roles (role_id, model_id) VALUES (10, 99);`,
		`INSERT INTO role_has_permissions (permission_id, role_id) VALUES (2, 10);`,
		`INSERT INTO role_has_permissions (permission_id, role_id) VALUES (3, 10);`,
	})

	authSvc := NewAuthService(db, nil, nil)
	permissions, err := authSvc.getUserPermissions(99)
	if err != nil {
		t.Fatalf("getUserPermissions returned error: %v", err)
	}

	want := []string{"reports-access", "service-orders-access", "users-access"}
	if !reflect.DeepEqual(permissions, want) {
		t.Fatalf("permissions mismatch\nwant: %#v\n got: %#v", want, permissions)
	}
}

func TestGetUserPermissions_EmptyWhenNoPermissionTables(t *testing.T) {
	db := setupAuthServiceTestDB(t)
	authSvc := NewAuthService(db, nil, nil)

	permissions, err := authSvc.getUserPermissions(1)
	if err != nil {
		t.Fatalf("expected nil error when tables are missing, got: %v", err)
	}

	if len(permissions) != 0 {
		t.Fatalf("expected empty permissions when tables are missing, got: %#v", permissions)
	}
}

func TestGetUserPermissions_UsesModelTypeAndDeduplicates(t *testing.T) {
	db := setupAuthServiceTestDB(t)
	execStatements(t, db, []string{
		`CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT NOT NULL, password_hash TEXT NOT NULL, name TEXT NOT NULL, phone TEXT, avatar TEXT, is_active INTEGER, last_login_at DATETIME, created_at DATETIME, updated_at DATETIME);`,
		`CREATE TABLE permissions (id INTEGER PRIMARY KEY, name TEXT NOT NULL);`,
		`CREATE TABLE roles (id INTEGER PRIMARY KEY, name TEXT NOT NULL);`,
		`CREATE TABLE model_has_permissions (permission_id INTEGER NOT NULL, model_id INTEGER NOT NULL, model_type TEXT NOT NULL);`,
		`CREATE TABLE model_has_roles (role_id INTEGER NOT NULL, model_id INTEGER NOT NULL, model_type TEXT NOT NULL);`,
		`CREATE TABLE role_has_permissions (permission_id INTEGER NOT NULL, role_id INTEGER NOT NULL);`,
		`INSERT INTO users (id, email, password_hash, name, phone, avatar, is_active, created_at, updated_at) VALUES (99, 'admin@test.local', 'hashed', 'Admin', '', '', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`,
		`INSERT INTO permissions (id, name) VALUES (1, 'service-orders-access');`,
		`INSERT INTO permissions (id, name) VALUES (2, 'reports-access');`,
		`INSERT INTO roles (id, name) VALUES (10, 'admin');`,
		`INSERT INTO model_has_permissions (permission_id, model_id, model_type) VALUES (1, 99, 'App\\Models\\User');`,
		`INSERT INTO model_has_permissions (permission_id, model_id, model_type) VALUES (2, 99, 'App\\Models\\Vehicle');`,
		`INSERT INTO model_has_roles (role_id, model_id, model_type) VALUES (10, 99, 'App\\Models\\User');`,
		`INSERT INTO role_has_permissions (permission_id, role_id) VALUES (1, 10);`,
		`INSERT INTO role_has_permissions (permission_id, role_id) VALUES (2, 10);`,
	})

	authSvc := NewAuthService(db, nil, nil)
	permissions, err := authSvc.getUserPermissions(99)
	if err != nil {
		t.Fatalf("getUserPermissions returned error: %v", err)
	}

	want := []string{"reports-access", "service-orders-access"}
	if !reflect.DeepEqual(permissions, want) {
		t.Fatalf("permissions mismatch\nwant: %#v\n got: %#v", want, permissions)
	}
}

func TestGetCurrentUser_IncludesPermissions(t *testing.T) {
	db := setupAuthServiceTestDB(t)
	execStatements(t, db, []string{
		`CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT NOT NULL, password_hash TEXT NOT NULL, name TEXT NOT NULL, phone TEXT, avatar TEXT, is_active INTEGER, last_login_at DATETIME, created_at DATETIME, updated_at DATETIME);`,
		`CREATE TABLE permissions (id INTEGER PRIMARY KEY, name TEXT NOT NULL);`,
		`CREATE TABLE roles (id INTEGER PRIMARY KEY, name TEXT NOT NULL);`,
		`CREATE TABLE model_has_permissions (permission_id INTEGER NOT NULL, model_id INTEGER NOT NULL, model_type TEXT NOT NULL);`,
		`CREATE TABLE model_has_roles (role_id INTEGER NOT NULL, model_id INTEGER NOT NULL, model_type TEXT NOT NULL);`,
		`CREATE TABLE role_has_permissions (permission_id INTEGER NOT NULL, role_id INTEGER NOT NULL);`,
		`INSERT INTO users (id, email, password_hash, name, phone, avatar, is_active, created_at, updated_at) VALUES (7, 'cashier@test.local', 'hashed', 'Cashier', '08123', '', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`,
		`INSERT INTO roles (id, name) VALUES (11, 'cashier');`,
		`INSERT INTO permissions (id, name) VALUES (3, 'part-sales-access');`,
		`INSERT INTO model_has_roles (role_id, model_id, model_type) VALUES (11, 7, 'App\\Models\\User');`,
		`INSERT INTO role_has_permissions (permission_id, role_id) VALUES (3, 11);`,
	})

	authSvc := NewAuthService(db, nil, nil)
	claims := &TokenClaims{UserID: 7}

	user, err := authSvc.GetCurrentUser(claims)
	if err != nil {
		t.Fatalf("GetCurrentUser returned error: %v", err)
	}

	if user == nil {
		t.Fatal("GetCurrentUser returned nil user")
	}

	if !reflect.DeepEqual(user.Roles, []string{"cashier"}) {
		t.Fatalf("roles mismatch\nwant: %#v\n got: %#v", []string{"cashier"}, user.Roles)
	}

	if !reflect.DeepEqual(user.Permissions, []string{"part-sales-access"}) {
		t.Fatalf("permissions mismatch\nwant: %#v\n got: %#v", []string{"part-sales-access"}, user.Permissions)
	}
}
