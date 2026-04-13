# Setup GO Backend with SQLite
# Usage: .\scripts\setup-go-sqlite.ps1

param(
    [string]$Mode = "dev",  # dev, test, production
    [switch]$Force,         # Force recreation of database
    [string]$DataPath = "./data"
)

Write-Host "█ GO Backend SQLite Setup" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# Configuration
# ============================================================================

$DBPath = "$DataPath/posbengkel.db"
$MigrationFile = "go-backend/migrations/001_init_sqlite.sql"
$EnvFile = ".env"

# ============================================================================
# Validation
# ============================================================================

Write-Host "▶ Validating prerequisites..." -ForegroundColor Yellow

# Check sqlite3
$sqlite3 = Get-Command sqlite3 -ErrorAction SilentlyContinue
if ($null -eq $sqlite3) {
    Write-Host "✗ sqlite3 command not found. Please install SQLite." -ForegroundColor Red
    Write-Host "  Windows: Download from https://www.sqlite.org/download.html" -ForegroundColor Gray
    Write-Host "  Or: choco install sqlite" -ForegroundColor Gray
    exit 1
}
Write-Host "✓ sqlite3 found: $($sqlite3.Source)" -ForegroundColor Green

# Check migration file
if (-not (Test-Path $MigrationFile)) {
    Write-Host "✗ Migration file not found: $MigrationFile" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Migration file found" -ForegroundColor Green

# ============================================================================
# Setup Data Directory
# ============================================================================

if (-not (Test-Path $DataPath)) {
    Write-Host "▶ Creating data directory: $DataPath" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $DataPath -Force | Out-Null
    Write-Host "✓ Data directory created" -ForegroundColor Green
} else {
    Write-Host "✓ Data directory exists" -ForegroundColor Green
}

# ============================================================================
# Handle Existing Database
# ============================================================================

if (Test-Path $DBPath) {
    if ($Force) {
        Write-Host "▶ Removing existing database (Force mode)..." -ForegroundColor Yellow
        Remove-Item $DBPath -Force
        Write-Host "✓ Database removed" -ForegroundColor Green
    } else {
        Write-Host "⚠ Database already exists: $DBPath" -ForegroundColor Yellow
        $response = Read-Host "  Recreate? (y/n)"
        if ($response -eq "y") {
            Remove-Item $DBPath -Force
            Write-Host "✓ Database removed" -ForegroundColor Green
        } else {
            Write-Host "Skipping database creation" -ForegroundColor Gray
        }
    }
}

# ============================================================================
# Initialize Database Schema
# ============================================================================

Write-Host "▶ Initializing SQLite database: $DBPath" -ForegroundColor Yellow

try {
    $migrationContent = Get-Content $MigrationFile -Raw
    $migrationContent | sqlite3 $DBPath
    Write-Host "✓ Database schema created" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to create database: $_" -ForegroundColor Red
    exit 1
}

# ============================================================================
# Verify Database
# ============================================================================

Write-Host "▶ Verifying database..." -ForegroundColor Yellow

try {
    $tables = sqlite3 $DBPath ".tables"
    $tableCount = ($tables -split '\s+').Count
    Write-Host "✓ Database verified ($tableCount tables)" -ForegroundColor Green
    Write-Host "  Tables: $(($tables -split '\s+')[0..4] -join ', ')..." -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed to verify database: $_" -ForegroundColor Red
    exit 1
}

# ============================================================================
# Setup Environment Configuration
# ============================================================================

Write-Host "▶ Configuring environment..." -ForegroundColor Yellow

# Check if .env exists
if (-not (Test-Path $EnvFile)) {
    Write-Host "⚠ .env file not found, creating..." -ForegroundColor Yellow
    $envTemplate = @"
# GO Backend Configuration
GO_DATABASE_DRIVER=sqlite
GO_DATABASE_SQLITE_PATH=./data/posbengkel.db

# Uncomment to use MySQL instead:
# GO_DATABASE_DRIVER=mysql
# GO_DATABASE_HOST=127.0.0.1
# GO_DATABASE_PORT=3306
# GO_DATABASE_NAME=laravel12_pos_bengkel
# GO_DATABASE_USER=root
# GO_DATABASE_PASSWORD=root

GO_PORT=8081
GO_LOG_LEVEL=info
GO_ENVIRONMENT=$Mode

JWT_SECRET=your-secret-key-change-in-production
JWT_TIMEOUT=24h

WEBSOCKET_ENABLED=true
WEBSOCKET_PORT=8081
WEBSOCKET_PATH=/ws
"@
    $envTemplate | Out-File $EnvFile -Encoding UTF8
    Write-Host "✓ Created .env template" -ForegroundColor Green
} else {
    # Check if SQLite driver is set
    $envContent = Get-Content $EnvFile -Raw
    if ($envContent -notmatch "GO_DATABASE_DRIVER") {
        Write-Host "⚠ GO_DATABASE_DRIVER not found in .env, adding..." -ForegroundColor Yellow
        Add-Content $EnvFile ""
        Add-Content $EnvFile "# GO Database Configuration"
        Add-Content $EnvFile "GO_DATABASE_DRIVER=sqlite"
        Add-Content $EnvFile "GO_DATABASE_SQLITE_PATH=./data/posbengkel.db"
        Write-Host "✓ Environment configured for SQLite" -ForegroundColor Green
    } else {
        Write-Host "✓ Environment already configured" -ForegroundColor Green
    }
}

# ============================================================================
# Display Setup Summary
# ============================================================================

Write-Host ""
Write-Host "░ Setup Complete! ░" -ForegroundColor Green
Write-Host ""
Write-Host "Database Information:" -ForegroundColor Cyan
Write-Host "  File: $DBPath"
Write-Host "  Size: $((Get-Item $DBPath).Length) bytes"
Write-Host "  Driver: SQLite"
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Start GO backend:"
Write-Host "     cd go-backend"
Write-Host "     `$env:GO_DATABASE_DRIVER='sqlite'"
Write-Host "     go run ./cmd/api"
Write-Host ""
Write-Host "  2. Start GO Frontend (in another terminal):"
Write-Host "     cd go-frontend"
Write-Host "     npm install"
Write-Host "     npm run dev"
Write-Host ""
Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "  Mode: $Mode"
Write-Host "  Env file: $EnvFile"
Write-Host "  Migration: $MigrationFile"
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Cyan
Write-Host "  - GO_SQLITE_ARCHITECTURE.md (architecture & troubleshooting)"
Write-Host "  - go-backend/README.md (GO backend guide)"
Write-Host "  - go-frontend/README.md (React SPA guide)"
Write-Host ""
