$ErrorActionPreference = 'Continue'

$projectRoot = Split-Path -Parent $PSScriptRoot
$startScript = Join-Path $PSScriptRoot 'start-reverb-if-needed.ps1'
$logDir = Join-Path $projectRoot 'storage\logs'
$logPath = Join-Path $logDir 'reverb-watchdog.log'
$pidPath = Join-Path $logDir 'reverb-watchdog.pid'
$intervalSeconds = 60

if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

function Write-Log {
    param([string] $Message)

    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    Add-Content -Path $logPath -Value "[$timestamp] $Message"
}

if (Test-Path $pidPath) {
    $existingPidRaw = Get-Content $pidPath -ErrorAction SilentlyContinue | Select-Object -First 1
    $existingPid = 0
    [void][int]::TryParse($existingPidRaw, [ref]$existingPid)

    if ($existingPid -gt 0) {
        $existingWatchdog = Get-CimInstance Win32_Process -Filter "ProcessId = $existingPid" -ErrorAction SilentlyContinue
        if ($existingWatchdog -and $existingWatchdog.CommandLine -like '*watch-reverb.ps1*') {
            Write-Log "Watchdog already running with PID $existingPid, exiting duplicate instance"
            exit 0
        }
    }
}

Set-Content -Path $pidPath -Value $PID -Encoding ASCII

Register-EngineEvent PowerShell.Exiting -Action {
    if (Test-Path $using:pidPath) {
        Remove-Item $using:pidPath -Force -ErrorAction SilentlyContinue
    }
} | Out-Null

if (-not (Test-Path $startScript)) {
    Write-Log "Start script not found at $startScript"
    exit 1
}

Write-Log 'Reverb watchdog started'

while ($true) {
    try {
        & $startScript | ForEach-Object {
            $line = [string] $_
            if ($line -match '^\[[0-9]{4}-[0-9]{2}-[0-9]{2}\s+[0-9]{2}:[0-9]{2}:[0-9]{2}\]') {
                Add-Content -Path $logPath -Value $line
            } else {
                Write-Log $line
            }
        }
    } catch {
        Write-Log "Watchdog error: $($_.Exception.Message)"
    }

    Start-Sleep -Seconds $intervalSeconds
}
