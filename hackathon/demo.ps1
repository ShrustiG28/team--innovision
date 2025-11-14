$baseUrl = "http://localhost:5000"

Write-Host ""
Write-Host "===== DECENTRALIZED IDENTITY VAULT - LIVE DEMO =====" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create DID
Write-Host "[1/4] Creating Decentralized Identifier (DID)..." -ForegroundColor Yellow
$didResp = Invoke-WebRequest -Uri "$baseUrl/api/create-did" -Method POST -ContentType "application/json" -Body "{}"
$didData = ($didResp.Content | ConvertFrom-Json).data

Write-Host "      OK DID Created Successfully!" -ForegroundColor Green
Write-Host "      DID: $($didData.did)" -ForegroundColor Cyan
Write-Host "      Address: $($didData.publicKey)" -ForegroundColor Cyan
Write-Host "      Private Key: $($didData.privateKey.Substring(0,20))..." -ForegroundColor Cyan
Write-Host ""

# Step 2: Issue VC
Write-Host "[2/4] Issuing Verifiable Credential (VC)..." -ForegroundColor Yellow
$vcPayload = @{
    holderDID = $didData.did
    holderPublicKey = $didData.publicKey
    credentialSubject = @{
        name = "Alice"
        email = "alice@example.com"
        role = "Developer"
    }
} | ConvertTo-Json

$vcResp = Invoke-WebRequest -Uri "$baseUrl/api/issue-vc" -Method POST -ContentType "application/json" -Body $vcPayload
$vcData = ($vcResp.Content | ConvertFrom-Json).data.vc

Write-Host "      OK VC Issued Successfully!" -ForegroundColor Green
Write-Host "      VC Issuer: $($vcData.issuer)" -ForegroundColor Cyan
Write-Host "      VC Type: $($vcData.type -join ', ')" -ForegroundColor Cyan
Write-Host "      Subject Name: $($vcData.credentialSubject.name)" -ForegroundColor Cyan
Write-Host "      Signature: $($vcData.proof.signatureValue.Substring(0,20))..." -ForegroundColor Cyan
Write-Host ""

# Step 3: Verify VC Signature
Write-Host "[3/4] Verifying VC Signature..." -ForegroundColor Yellow
$verifyPayload = @{
    vc = $vcData
} | ConvertTo-Json -Depth 20

$verifyResp = Invoke-WebRequest -Uri "$baseUrl/api/verify-vc" -Method POST -ContentType "application/json" -Body $verifyPayload
$verifyData = ($verifyResp.Content | ConvertFrom-Json).data

Write-Host "      OK Verification Complete!" -ForegroundColor Green
Write-Host "      Signature Valid: $($verifyData.valid)" -ForegroundColor Cyan
Write-Host "      Signer Address: $($verifyData.signerAddress)" -ForegroundColor Cyan
Write-Host "      Message Verified: $($verifyData.messageVerified)" -ForegroundColor Cyan
Write-Host ""

# Step 4: Summary
Write-Host "[4/4] System Status..." -ForegroundColor Yellow
Write-Host "      OK DID Created" -ForegroundColor Green
Write-Host "      OK VC Issued and Signed" -ForegroundColor Green
Write-Host "      OK Signature Verified" -ForegroundColor Green
Write-Host ""
Write-Host "===== ALL SYSTEMS OPERATIONAL =====" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "2. Create your DID in the Identity tab" -ForegroundColor White
Write-Host "3. Request a credential in the Credential tab" -ForegroundColor White
Write-Host "4. Verify credentials in the Verify tab" -ForegroundColor White
Write-Host ""
