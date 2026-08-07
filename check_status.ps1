$headers = @{'Accept'='application/vnd.github+json'}
$runs = (Invoke-RestMethod -Uri 'https://api.github.com/repos/sarthakofficial25-alt/Crowd-Funding/actions/runs?per_page=4' -Headers $headers).workflow_runs
foreach ($run in $runs) {
    Write-Host "$($run.id) | $($run.name) | $($run.status) | $($run.conclusion) | $($run.head_sha.Substring(0,7))"
}

# Get jobs for first two runs (commit 6dd3b33)
foreach ($run in $runs[0..1]) {
    Write-Host "`n--- Jobs for $($run.name) (run $($run.id)) ---"
    $jobs = (Invoke-RestMethod -Uri "https://api.github.com/repos/sarthakofficial25-alt/Crowd-Funding/actions/runs/$($run.id)/jobs" -Headers $headers).jobs
    foreach ($job in $jobs) {
        Write-Host "  $($job.name) | $($job.status) | $($job.conclusion)"
        foreach ($step in $job.steps) {
            $icon = if ($step.conclusion -eq 'success') { 'OK' } elseif ($step.conclusion -eq 'failure') { 'FAIL' } elseif ($step.status -eq 'in_progress') { 'RUNNING' } else { $step.conclusion }
            if ($step.conclusion -eq 'failure') {
                Write-Host "    [$icon] $($step.name)"
            }
        }
    }
}
