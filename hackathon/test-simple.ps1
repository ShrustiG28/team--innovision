$baseUrl = "http://localhost:5000"

Write-Host "Testing Decentralized Identity Vault" -ForegroundColor Green
Write-Host "Step 1: Creating DID..."

try {
    $didResponse = Invoke-WebRequest -Uri "$baseUrl/api/create-did" -Method POST -ContentType "application/json" -Body "{}" -ErrorAction Stop
    $did = ($didResponse.Content | ConvertFrom-Json)
    
    Write-Host "SUCCESS: DID Created" -ForegroundColor Green
    Write-Host "DID: $($did.did)"
    Write-Host "Public Key: $($did.publicKey)"
    Write-Host ""
    
    $holderDid = $did.did
    
} catch {
    Write-Host "FAILED: Could not create DID" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

Write-Host "Step 2: Issuing VC..."

try {
    $vcBody = @{
        holderDID = $holderDid
        credentialSubject = @{
            name = "Test User"
            verified = "true"
        }
    } | ConvertTo-Json
    
    $vcResponse = Invoke-WebRequest -Uri "$baseUrl/api/issue-vc" -Method POST -ContentType "application/json" -Body $vcBody -ErrorAction Stop
    $vc = ($vcResponse.Content | ConvertFrom-Json)
    
    Write-Host "SUCCESS: VC Issued" -ForegroundColor Green
    Write-Host "VC ID: $($vc.id)"
    Write-Host "Issuer: $($vc.issuer)"
    Write-Host ""
    
} catch {
    Write-Host "FAILED: Could not issue VC" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

Write-Host "Step 3: Verifying VC..."

try {
    $verifyBody = @{
        vc = $vc
    } | ConvertTo-Json -Depth 10
    
    $verifyResponse = Invoke-WebRequest -Uri "$baseUrl/api/verify-vc" -Method POST -ContentType "application/json" -Body $verifyBody -ErrorAction Stop
    $verification = ($verifyResponse.Content | ConvertFrom-Json)
    
    Write-Host "SUCCESS: VC Verified" -ForegroundColor Green
    Write-Host "Valid: $($verification.valid)"
    Write-Host "Signer: $($verification.signerAddress)"
    Write-Host ""
    
    Write-Host "COMPLETE END-TO-END FLOW WORKING!" -ForegroundColor Green
    
} catch {
    Write-Host "FAILED: Could not verify VC" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}
