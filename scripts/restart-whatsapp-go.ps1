$ErrorActionPreference = 'Stop'

$scriptDir = $PSScriptRoot
$stopScript = Join-Path $scriptDir 'stop-whatsapp-go.ps1'
$startScript = Join-Path $scriptDir 'start-whatsapp-go.ps1'

if (-not (Test-Path $stopScript)) {
    Write-Output "Stop script not found: $stopScript"
    exit 1
}

if (-not (Test-Path $startScript)) {
    Write-Output "Start script not found: $startScript"
    exit 1
}

Write-Output '[restart-whatsapp-go] Stopping existing service (if running)...'
& $stopScript

Start-Sleep -Milliseconds 800

Write-Output '[restart-whatsapp-go] Starting service...'
& $startScript

$exitCode = $LASTEXITCODE
if ($exitCode -ne 0) {
    Write-Output "[restart-whatsapp-go] Start step failed with exit code $exitCode"
    exit $exitCode
}

Write-Output '[restart-whatsapp-go] Done.'
exit 0
