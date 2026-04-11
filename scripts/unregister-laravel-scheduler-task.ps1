param(
    [string]$TaskName = "POS-Bengkel-Laravel-Scheduler"
)

$ErrorActionPreference = "Stop"

try {
    $task = Get-ScheduledTask -TaskName $TaskName -ErrorAction Stop
    Unregister-ScheduledTask -TaskName $Task.TaskName -Confirm:$false
} catch {
    & schtasks.exe /Query /TN $TaskName *> $null
    if ($LASTEXITCODE -ne 0) {
        Write-Host ("Task tidak ditemukan. TaskName={0}" -f $TaskName)
        exit 0
    }

    $deleteOutput = & schtasks.exe /Delete /TN $TaskName /F 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw ("Gagal menghapus scheduled task '{0}'.{1}{2}" -f $TaskName, [Environment]::NewLine, $deleteOutput)
    }
}

Write-Host ("Scheduled task dihapus. TaskName={0}" -f $TaskName)
