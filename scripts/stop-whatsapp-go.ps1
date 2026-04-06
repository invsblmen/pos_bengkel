$ErrorActionPreference = 'Continue'

$projectRoot = Split-Path -Parent $PSScriptRoot
$logDir = Join-Path $projectRoot 'storage\logs'
$logPath = Join-Path $logDir 'whatsapp-go-stop.log'
$pidPath = Join-Path $logDir 'whatsapp-go.pid'
$port = 3000

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

$stopped = $false

if (Test-Path $pidPath) {
    $pidRaw = Get-Content $pidPath -ErrorAction SilentlyContinue | Select-Object -First 1
    $processId = 0
    [void][int]::TryParse($pidRaw, [ref]$processId)

    if ($processId -gt 0) {
        $process = Get-CimInstance Win32_Process -Filter "ProcessId = $processId" -ErrorAction SilentlyContinue
        if ($process) {
            try {
                Stop-Process -Id $processId -Force -ErrorAction Stop
                Write-Log "Stopped WhatsApp Go process PID $processId"
                $stopped = $true
            } catch {
                Write-Log "Failed to stop PID $($processId): $($_.Exception.Message)"
            }
        } else {
            Write-Log "PID file found but process $processId no longer exists"
        }
    }
}

if (-not $stopped) {
    $listeners = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($listeners) {
        foreach ($listener in $listeners) {
            try {
                Stop-Process -Id $listener.OwningProcess -Force -ErrorAction Stop
                Write-Log "Stopped process on port $port with PID $($listener.OwningProcess)"
                $stopped = $true
            } catch {
                Write-Log "Failed to stop process on port $port PID $($listener.OwningProcess): $($_.Exception.Message)"
            }
        }
    }
}

if (Test-Path $pidPath) {
    Remove-Item $pidPath -Force -ErrorAction SilentlyContinue
}

if ($stopped) {
    exit 0
}

Write-Log 'No WhatsApp Go process was running'
exit 0
