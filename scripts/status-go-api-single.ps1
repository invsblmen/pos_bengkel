param(
    [int]$Port = 8081,
    [int]$TailLines = 20
)

$ErrorActionPreference = 'SilentlyContinue'

$root = Resolve-Path (Join-Path $PSScriptRoot '..')
$logDir = Join-Path $root 'storage\logs'
$pidFile = Join-Path $logDir 'go-api-single.pid'
$outLog = Join-Path $logDir 'go-api-single.out.log'
$errLog = Join-Path $logDir 'go-api-single.err.log'

function Write-Line {
    param([string]$Message)

    Write-Output $Message
}

function Write-LogTail {
    param(
        [string]$Path,
        [int]$Lines
    )

    if (-not (Test-Path $Path)) {
        Write-Line ("LOG={0}" -f $Path)
        Write-Line "TAIL=(file not found)"
        return
    }

    Write-Line ("LOG={0}" -f $Path)
    Write-Line "TAIL_START"
    Get-Content $Path -Tail $Lines | ForEach-Object { Write-Output $_ }
    Write-Line "TAIL_END"
}

$listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($null -ne $listener) {
    $proc = Get-Process -Id $listener.OwningProcess | Select-Object -First 1
    Write-Line "STATUS=RUNNING"
    Write-Line ("PORT={0}" -f $Port)
    Write-Line ("LISTENER_PID={0}" -f $listener.OwningProcess)
    Write-Line ("PROCESS={0}" -f $proc.ProcessName)
} else {
    Write-Line "STATUS=STOPPED"
    Write-Line ("PORT={0}" -f $Port)
}

if (Test-Path $pidFile) {
    $rawProcessId = Get-Content $pidFile | Select-Object -First 1
    Write-Line ("PID_FILE={0}" -f $rawProcessId)
} else {
    Write-Line "PID_FILE=NONE"
}

Write-Line ""
Write-Line "OUT_LOG"
Write-LogTail -Path $outLog -Lines $TailLines
Write-Line ""
Write-Line "ERR_LOG"
Write-LogTail -Path $errLog -Lines $TailLines
