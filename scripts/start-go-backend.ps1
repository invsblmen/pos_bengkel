param(
    [int]$Port = 8081,
    [switch]$UseGoRun,
    [switch]$KillExisting
)

$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path $PSScriptRoot '..')
Push-Location $root
try {
    if ($UseGoRun -and $KillExisting) {
        .\scripts\start-go-api-single.ps1 -Port $Port -UseGoRun -KillExisting
    } elseif ($UseGoRun) {
        .\scripts\start-go-api-single.ps1 -Port $Port -UseGoRun
    } elseif ($KillExisting) {
        .\scripts\start-go-api-single.ps1 -Port $Port -KillExisting
    } else {
        .\scripts\start-go-api-single.ps1 -Port $Port
    }
} finally {
    Pop-Location
}
