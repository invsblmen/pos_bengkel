param(
    [int]$Port = 8081,
    [int]$TailLines = 20
)

$ErrorActionPreference = 'SilentlyContinue'

$root = Resolve-Path (Join-Path $PSScriptRoot '..')
Push-Location $root
try {
    .\scripts\status-go-api-single.ps1 -Port $Port -TailLines $TailLines
} finally {
    Pop-Location
}
