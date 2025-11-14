import express from 'express';
import {
  verifyVCSignature,
  getIssuerPublicKey
} from '../services/vcService.js';

const router = express.Router();

/**
 * POST /api/verify-vc
 * Verify the authenticity of a Verifiable Credential
 * Checks:
 * 1. VC has a valid proof/signature
 * 2. Signature was created by the issuer
 * 3. VC data hasn't been tampered with
 *
 * Request body:
 * {
 *   "vc": { ... },
 *   "issuerPublicKey": "0x..." (optional, defaults to known issuer)
 * }
 */
router.post('/verify-vc', (req, res) => {
  try {
    const { vc, issuerPublicKey } = req.body;

    if (!vc) {
      return res.status(400).json({
        success: false,
        error: 'Missing VC in request body'
      });
    }

    console.log(`\n📝 Processing /verify-vc request`);
    console.log(`   VC Issuer: ${vc.issuer}`);
    console.log(`   Has Proof: ${!!vc.proof}`);

    // Use provided issuer public key or default to known issuer
    const publicKeyToCheck = issuerPublicKey || getIssuerPublicKey();

    // Verify the VC signature
    console.log('\n🔐 Verifying VC signature...');
    const verificationResult = verifyVCSignature(vc, publicKeyToCheck);

    console.log(`\n✅ Verification Result: ${verificationResult.valid ? '✅ VALID' : '❌ INVALID'}`);

    // Return detailed verification result
    res.json({
      success: true,
      data: {
        valid: verificationResult.valid,
        issuer: verificationResult.issuer,
        credentialType: vc.type,
        credentialSubject: vc.credentialSubject,
        issuanceDate: vc.issuanceDate,
        proofDetails: {
          type: vc.proof?.type,
          verificationMethod: verificationResult.verificationMethod,
          created: vc.proof?.created
        },
        verification: {
          signatureValid: verificationResult.valid,
          issuerMatches: verificationResult.recoveredAddress?.toLowerCase() === publicKeyToCheck.toLowerCase(),
          recoveredAddress: verificationResult.recoveredAddress,
          timestamp: verificationResult.timestamp
        }
      },
      message: verificationResult.valid 
        ? '✅ Credential is valid and authentic!' 
        : `❌ Verification failed: ${verificationResult.reason}`
    });
  } catch (error) {
    console.error('❌ Error in /verify-vc:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/verify-signature
 * Simple endpoint to verify just the signature (lower-level verification)
 *
 * Request body:
 * {
 *   "vc": { ... },
 *   "issuerPublicKey": "0x..."
 * }
 */
router.post('/verify-signature', (req, res) => {
  try {
    const { vc, issuerPublicKey } = req.body;

    if (!vc || !vc.proof) {
      return res.status(400).json({
        success: false,
        error: 'VC must have a proof/signature'
      });
    }

    if (!issuerPublicKey) {
      return res.status(400).json({
        success: false,
        error: 'issuerPublicKey is required'
      });
    }

    console.log(`\n🔍 Verifying signature for VC issued by ${vc.issuer}`);

    const result = verifyVCSignature(vc, issuerPublicKey);

    res.json({
      success: true,
      data: {
        valid: result.valid,
        issuer: result.issuer,
        recoveredAddress: result.recoveredAddress,
        reason: result.reason
      }
    });
  } catch (error) {
    console.error('❌ Error in /verify-signature:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
