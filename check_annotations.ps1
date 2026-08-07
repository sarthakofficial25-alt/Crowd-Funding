$headers = @{'Accept'='application/vnd.github+json'}

# CI Pipeline contract test job
$ciJobs = (Invoke-RestMethod -Uri 'https://api.github.com/repos/sarthakofficial25-alt/Crowd-Funding/actions/runs/31202185979/jobs' -Headers $headers).jobs
$contractJob = $ciJobs | Where-Object { $_.name -match 'Smart Contract' }
Write-Host "Contract Job ID: $($contractJob.id)"
$annotations = Invoke-RestMethod -Uri "https://api.github.com/repos/sarthakofficial25-alt/Crowd-Funding/check-runs/$($contractJob.id)/annotations" -Headers $headers
foreach ($a in $annotations) {
    Write-Host "ANNOTATION: $($a.message)"
}

# CD Pipeline WASM build job
Write-Host "`n--- CD Pipeline ---"
$cdJobs = (Invoke-RestMethod -Uri 'https://api.github.com/repos/sarthakofficial25-alt/Crowd-Funding/actions/runs/31202185934/jobs' -Headers $headers).jobs
$wasmJob = $cdJobs | Where-Object { $_.name -match 'Deploy Smart' }
Write-Host "WASM Job ID: $($wasmJob.id)"
$annotations2 = Invoke-RestMethod -Uri "https://api.github.com/repos/sarthakofficial25-alt/Crowd-Funding/check-runs/$($wasmJob.id)/annotations" -Headers $headers
foreach ($a in $annotations2) {
    Write-Host "ANNOTATION: $($a.message)"
}
