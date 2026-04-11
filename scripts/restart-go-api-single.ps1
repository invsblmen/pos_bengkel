param(
    [int]$Port = 8081,
    [switch]$UseGoRun,
    [switch]$ShowStatus
)

$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path $PSScriptRoot '..')

Push-Location $root
try {
    .\scripts\stop-go-api-single.ps1 -Port $Port

    if ($UseGoRun) {
        .\scripts\start-go-api-single.ps1 -Port $Port -KillExisting -UseGoRun
    } else {
        .\scripts\start-go-api-single.ps1 -Port $Port -KillExisting
    }

    if ($ShowStatus) {
        .\scripts\status-go-api-single.ps1 -Port $Port -TailLines 20
    }
} finally {
    Pop-Location
}
