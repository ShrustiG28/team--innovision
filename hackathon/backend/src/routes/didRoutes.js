import express from 'express';
import { generateDID, createDIDDocument } from '../services/didService.js';

const router = express.Router();

/**
 * POST /api/create-did
 * Generate a new Decentralized Identifier (DID) for a user
 * Returns the DID, public key, and private key for secure local storage
 */
router.post('/create-did', (req, res) => {
  try {
    console.log('\n📝 Processing /create-did request...');

    // Generate DID and keys
    const didData = generateDID();

    // Create W3C-compliant DID Document
    const didDocument = createDIDDocument(didData.did, didData.publicKey);

    console.log(`\n📋 DID Document created`);

    // Return the DID and keys to the client
    // The client will store the private key securely in local storage
    res.json({
      success: true,
      data: {
        did: didData.did,
        publicKey: didData.publicKey,
        privateKey: didData.privateKey, // ⚠️ Return only once - client must store securely
        didDocument: didDocument,
        createdAt: didData.createdAt
      },
      message: '✅ DID created successfully. Store the private key securely!'
    });
  } catch (error) {
    console.error('❌ Error in /create-did:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/did-info/:did
 * Retrieve information about a DID (for verification purposes)
 * This simulates a DID resolution service
 */
router.get('/did-info/:did', (req, res) => {
  try {
    const { did } = req.params;

    console.log(`\n🔍 Resolving DID: ${did}`);

    // Validate DID format
    if (!did.startsWith('did:ethr:0x')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid DID format'
      });
    }

    // Extract public key from DID
    const publicKey = did.replace('did:ethr:', '');

    // Create a mock DID document
    const didDocument = createDIDDocument(did, publicKey);

    console.log(`✅ DID resolved: ${did}`);

    res.json({
      success: true,
      data: {
        did,
        publicKey,
        didDocument
      }
    });
  } catch (error) {
    console.error('❌ Error in /did-info:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
