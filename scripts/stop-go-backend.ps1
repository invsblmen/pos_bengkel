param(
    [int]$Port = 8081
)

$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path $PSScriptRoot '..')
Push-Location $root
try {
    .\scripts\stop-go-api-single.ps1 -Port $Port
} finally {
    Pop-Location
}
