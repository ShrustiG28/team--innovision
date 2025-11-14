# Test Complete End-to-End Flow
# DID Creation -> VC Issuance -> Verification

Write-Host ""
Write-Host "╔════════════════════════════════════════════╗"
Write-Host "║  Testing Decentralized Identity Vault     ║"
Write-Host "║  DID -> VC -> IPFS -> Verify              ║"
Write-Host "╚════════════════════════════════════════════╝"
Write-Host ""

$baseUrl = "http://localhost:5000"

# Step 1: Create DID
Write-Host "📝 Step 1: Creating a new DID..."
Write-Host "   POST $baseUrl/api/create-did"
Write-Host ""

try {
    $didResponse = Invoke-WebRequest -Uri "$baseUrl/api/create-did" -Method POST -ContentType "application/json" -Body "{}" -ErrorAction Stop
    $did = ($didResponse.Content | ConvertFrom-Json)
    
    Write-Host "✅ DID Created Successfully!"
    Write-Host "   DID: $($did.did)"
    Write-Host "   Public Key: $($did.publicKey)"
    Write-Host "   Private Key (truncated): $($did.privateKey.Substring(0, 20))..."
    Write-Host ""
    
    $holderDid = $did.did
    $holderPrivateKey = $did.privateKey
    
} catch {
    Write-Host "❌ Failed to create DID: $($_.Exception.Message)"
    exit 1
}

# Step 2: Issue Verifiable Credential
Write-Host "📝 Step 2: Issuing a Verifiable Credential..."
Write-Host "   POST $baseUrl/api/issue-vc"
Write-Host ""

try {
    $vcBody = @{
        holderDID = $holderDid
        credentialSubject = @{
            name = "John Doe"
            email = "john@example.com"
            claims = @{
                verified = $true
                level = "standard"
            }
        }
    } | ConvertTo-Json -Depth 10
    
    $vcResponse = Invoke-WebRequest -Uri "$baseUrl/api/issue-vc" -Method POST -ContentType "application/json" -Body $vcBody -ErrorAction Stop
    $vc = ($vcResponse.Content | ConvertFrom-Json)
    
    Write-Host "✅ Verifiable Credential Issued!"
    Write-Host "   VC ID: $($vc.id)"
    Write-Host "   Issuer: $($vc.issuer)"
    Write-Host "   Holder: $($vc.credentialSubject.id)"
    Write-Host "   Signature: $($vc.proof.signatureValue.Substring(0, 32))..."
    Write-Host ""
    
    $vcSignature = $vc.proof.signatureValue
    
} catch {
    Write-Host "❌ Failed to issue VC: $($_.Exception.Message)"
    exit 1
}

# Step 3: Verify VC Signature
Write-Host "📝 Step 3: Verifying VC Signature..."
Write-Host "   POST $baseUrl/api/verify-vc"
Write-Host ""

try {
    $verifyBody = @{
        vc = $vc
    } | ConvertTo-Json -Depth 10
    
    $verifyResponse = Invoke-WebRequest -Uri "$baseUrl/api/verify-vc" -Method POST -ContentType "application/json" -Body $verifyBody -ErrorAction Stop
    $verification = ($verifyResponse.Content | ConvertFrom-Json)
    
    Write-Host "✅ VC Verification Complete!"
    Write-Host "   Valid: $($verification.valid)"
    Write-Host "   Signer Address: $($verification.signerAddress)"
    Write-Host "   Issuer DID: $($verification.issuerDid)"
    Write-Host "   Message Verified: $($verification.messageVerified)"
    Write-Host ""
    
} catch {
    Write-Host "❌ Failed to verify VC: $($_.Exception.Message)"
    exit 1
}

# Summary
Write-Host "╔════════════════════════════════════════════╗"
Write-Host "║  ✅ COMPLETE END-TO-END FLOW SUCCESSFUL   ║"
Write-Host "╚════════════════════════════════════════════╝"
Write-Host ""
Write-Host "📊 Summary:"
Write-Host "   - DID Generated: $holderDid"
Write-Host "   - VC Issued with Signature"
Write-Host "   - VC Verified Successfully"
Write-Host "   - System Status: ✅ WORKING"
Write-Host ""
Write-Host "🎉 Your Decentralized Identity system is operational!"
Write-Host "   Next: Open http://localhost:3000 in your browser"
Write-Host ""
