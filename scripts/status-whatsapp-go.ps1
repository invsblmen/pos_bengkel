$ErrorActionPreference = 'SilentlyContinue'

$projectRoot = Split-Path -Parent $PSScriptRoot
$logDir = Join-Path $projectRoot 'storage\logs'
$pidPath = Join-Path $logDir 'whatsapp-go.pid'
$port = 3000

function Write-Line {
    param([string] $Message)

    Write-Output $Message
}

$listener = Get-NetTCPConnection -LocalPort $port -State Listen | Select-Object -First 1
if ($listener) {
    $process = Get-CimInstance Win32_Process -Filter "ProcessId = $($listener.OwningProcess)" | Select-Object -First 1
    Write-Line "STATUS=RUNNING"
    Write-Line "PORT=$port"
    Write-Line "PID=$($listener.OwningProcess)"
    Write-Line "PROCESS=$($process.Name)"
    Write-Line "COMMAND=$($process.CommandLine)"
} else {
    Write-Line "STATUS=STOPPED"
    Write-Line "PORT=$port"
}

if (Test-Path $pidPath) {
    $pidRaw = Get-Content $pidPath | Select-Object -First 1
    Write-Line "PID_FILE=$pidRaw"
} else {
    Write-Line "PID_FILE=NONE"
}
