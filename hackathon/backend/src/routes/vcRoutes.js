import express from 'express';
import {
  createVerifiableCredential,
  signVerifiableCredential,
  createVCToken,
  getIssuerDID,
  getIssuerPublicKey
} from '../services/vcService.js';

const router = express.Router();

/**
 * POST /api/issue-vc
 * Backend simulates an issuer (e.g., University) and creates a signed Verifiable Credential
 * The VC is signed with the issuer's private key
 *
 * Request body:
 * {
 *   "holderDID": "did:ethr:0x...",
 *   "holderPublicKey": "0x...",
 *   "credentialSubject": { ... } (optional)
 * }
 */
router.post('/issue-vc', (req, res) => {
  try {
    const { holderDID, holderPublicKey, credentialSubject } = req.body;

    console.log(`\n📝 Processing /issue-vc request`);
    console.log(`   Holder DID: ${holderDID}`);

    // Validate request
    if (!holderDID || !holderPublicKey) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: holderDID, holderPublicKey'
      });
    }

    // Step 1: Create unsigned VC
    console.log('\n1️⃣  Creating unsigned VC...');
    const unsignedVC = createVerifiableCredential(
      holderDID,
      holderPublicKey,
      credentialSubject
    );

    // Step 2: Sign VC with issuer's private key
    console.log('\n2️⃣  Signing VC with issuer private key...');
    const signedVC = signVerifiableCredential(unsignedVC);

    // Step 3: Create JWT token for transmission
    console.log('\n3️⃣  Creating VC token...');
    const vcToken = createVCToken(signedVC);

    console.log('\n✅ VC Issuance Complete');
    console.log(`   Issuer: ${getIssuerDID()}`);
    console.log(`   Holder: ${holderDID}`);

    // Return the signed VC and token
    res.json({
      success: true,
      data: {
        vc: signedVC,
        vcToken: vcToken,
        issuer: {
          did: getIssuerDID(),
          publicKey: getIssuerPublicKey()
        },
        holder: {
          did: holderDID,
          publicKey: holderPublicKey
        }
      },
      message: '✅ VC issued successfully'
    });
  } catch (error) {
    console.error('❌ Error in /issue-vc:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/vc-info
 * Get information about a VC without verifying the signature
 * Useful for displaying VC metadata before verification
 *
 * Request body:
 * {
 *   "vc": { ... }
 * }
 */
router.post('/vc-info', (req, res) => {
  try {
    const { vc } = req.body;

    if (!vc) {
      return res.status(400).json({
        success: false,
        error: 'Missing VC in request body'
      });
    }

    console.log(`\n🔍 Extracting VC information`);

    const info = {
      type: vc.type || [],
      issuer: vc.issuer,
      issuanceDate: vc.issuanceDate,
      credentialSubject: vc.credentialSubject,
      hasSignature: !!vc.proof,
      signatureType: vc.proof?.type,
      context: vc['@context']
    };

    console.log(`✅ VC info extracted`);

    res.json({
      success: true,
      data: info
    });
  } catch (error) {
    console.error('❌ Error in /vc-info:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
