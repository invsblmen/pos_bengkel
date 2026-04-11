param(
    [string]$Date = (Get-Date).ToString('yyyy-MM-dd'),
    [int]$VarianceThreshold = 5,
    [int]$TrendDays = 7,
    [int]$CurrentCanary = 5,
    [switch]$SkipGate
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$reportDir = Join-Path $repoRoot 'storage\logs\go-migration'
$reportPath = Join-Path $reportDir ("metrics-{0}-{1}.log" -f $Date, $timestamp)

if (-not (Test-Path $reportDir)) {
    New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
}

function Write-Section {
    param([string]$Title)
    "" | Tee-Object -FilePath $reportPath -Append | Out-Null
    ("===== {0} =====" -f $Title) | Tee-Object -FilePath $reportPath -Append | Out-Null
}

function Invoke-AndLog {
    param(
        [string]$Title,
        [string]$Command
    )

    Write-Section -Title $Title
    ("$ {0}" -f $Command) | Tee-Object -FilePath $reportPath -Append | Out-Null

    $output = & cmd /c $Command 2>&1
    $exitCode = $LASTEXITCODE

    if ($null -ne $output) {
        $output | Tee-Object -FilePath $reportPath -Append | Out-Null
    }

    ("[exit_code] {0}" -f $exitCode) | Tee-Object -FilePath $reportPath -Append | Out-Null

    return $exitCode
}

Set-Location $repoRoot

("Collecting Go migration metrics for date {0}" -f $Date) | Tee-Object -FilePath $reportPath -Append | Out-Null
("Report file: {0}" -f $reportPath) | Tee-Object -FilePath $reportPath -Append | Out-Null

$reconciliationExit = Invoke-AndLog -Title 'Reconciliation Daily' -Command ("php artisan go:sync:reconciliation-daily --date={0} --max-variance-percent={1}" -f $Date, $VarianceThreshold)
$summaryExit = Invoke-AndLog -Title 'Shadow Summary' -Command ("php artisan go:shadow:summary --date={0} --save-csv" -f $Date)
$trendExit = Invoke-AndLog -Title 'Shadow Trend' -Command ("php artisan go:shadow:trend --days={0}" -f $TrendDays)

$gateExit = 0
if (-not $SkipGate) {
    $gateExit = Invoke-AndLog -Title 'Canary Gate' -Command ("php artisan go:canary:gate --days={0} --current={1}" -f $TrendDays, $CurrentCanary)
}

Write-Section -Title 'Summary'
("reconciliation_exit={0}" -f $reconciliationExit) | Tee-Object -FilePath $reportPath -Append | Out-Null
("shadow_summary_exit={0}" -f $summaryExit) | Tee-Object -FilePath $reportPath -Append | Out-Null
("shadow_trend_exit={0}" -f $trendExit) | Tee-Object -FilePath $reportPath -Append | Out-Null
("canary_gate_exit={0}" -f $gateExit) | Tee-Object -FilePath $reportPath -Append | Out-Null

if ($reconciliationExit -eq 0 -and $summaryExit -eq 0 -and $trendExit -eq 0 -and ($SkipGate -or $gateExit -eq 0)) {
    Write-Host ("Metrics collection completed successfully. Report: {0}" -f $reportPath)
    exit 0
}

Write-Warning ("Metrics collection completed with warnings/errors. Report: {0}" -f $reportPath)
exit 1
