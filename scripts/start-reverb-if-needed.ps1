$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$phpPath = 'C:\Users\dania\.config\herd\bin\php84\php.exe'
$artisanPath = Join-Path $projectRoot 'artisan'
$port = 8080
$logDir = Join-Path $projectRoot 'storage\logs'
$logPath = Join-Path $logDir 'reverb-autostart.log'

if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

function Write-Log {
    param([string] $Message)

    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $line = "[$timestamp] $Message"
    Add-Content -Path $logPath -Value $line
    Write-Output $line
}

$maxWaitSeconds = 60
$elapsed = 0
while ($elapsed -lt $maxWaitSeconds) {
    $herdRunning = Get-Process -Name 'Herd' -ErrorAction SilentlyContinue
    if ($herdRunning) {
        break
    }

    Start-Sleep -Seconds 2
    $elapsed += 2
}

if ($elapsed -ge $maxWaitSeconds -and -not (Get-Process -Name 'Herd' -ErrorAction SilentlyContinue)) {
    Write-Log 'Herd is not running yet, skipping Reverb startup'
    exit 0
}

if (-not (Test-Path $phpPath)) {
    Write-Log "PHP not found at $phpPath"
    exit 1
}

if (-not (Test-Path $artisanPath)) {
    Write-Log "Artisan file not found at $artisanPath"
    exit 1
}

$existing = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if ($existing) {
    Write-Log "Reverb is already listening on port $port"
    exit 0
}

Start-Process -FilePath $phpPath `
    -ArgumentList 'artisan', 'reverb:start', '--host=0.0.0.0', '--port=8080' `
    -WorkingDirectory $projectRoot `
    -WindowStyle Hidden

Start-Sleep -Seconds 2

$started = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if ($started) {
    Write-Log "Reverb started successfully on port $port"
    exit 0
}

Write-Log "Failed to start Reverb on port $port"
exit 1
