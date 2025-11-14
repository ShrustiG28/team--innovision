import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';

/**
 * DID Service - Handles Decentralized Identifier (DID) creation and management
 * Using did:ethr method with Ethereum-based keys
 */

/**
 * Generate a new DID and key pair
 * Returns a DID in the format: did:ethr:0x{publicKeyHex}
 *
 * @returns {Object} Object containing DID, publicKey, and privateKey
 */
export const generateDID = () => {
  try {
    // Generate a random wallet using ethers
    // This creates a random Ethereum-style key pair
    const wallet = ethers.Wallet.createRandom();

    // Extract keys and format as DID
    const publicKey = wallet.address; // Ethereum address format: 0x...
    const privateKey = wallet.privateKey; // Full private key
    const did = `did:ethr:${publicKey}`;

    console.log('\n✅ DID Generated Successfully');
    console.log(`   DID: ${did}`);
    console.log(`   Public Key (Address): ${publicKey}`);
    console.log(`   Private Key: ${privateKey.substring(0, 10)}...${privateKey.substring(privateKey.length - 4)}`);

    return {
      did,
      publicKey,
      privateKey,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error generating DID:', error.message);
    throw error;
  }
};

/**
 * Verify that a DID is valid
 *
 * @param {string} did - The DID to verify (format: did:ethr:0x...)
 * @returns {boolean} True if valid DID format
 */
export const isValidDID = (did) => {
  return typeof did === 'string' && did.startsWith('did:ethr:0x');
};

/**
 * Extract public key from DID
 *
 * @param {string} did - The DID string
 * @returns {string} The public key/address
 */
export const extractPublicKeyFromDID = (did) => {
  if (!isValidDID(did)) {
    throw new Error('Invalid DID format');
  }
  return did.replace('did:ethr:', '');
};

/**
 * Create a DID document (following W3C standards)
 * This provides metadata about the DID
 *
 * @param {string} did - The DID
 * @param {string} publicKey - The public key
 * @returns {Object} DID Document
 */
export const createDIDDocument = (did, publicKey) => {
  return {
    '@context': [
      'https://www.w3.org/ns/did/v1',
      'https://w3id.org/security/v2'
    ],
    id: did,
    publicKey: [
      {
        id: `${did}#keys-1`,
        type: 'EcdsaSecp256k1VerificationKey2019',
        controller: did,
        publicKeyHex: publicKey
      }
    ],
    authentication: [
      `${did}#keys-1`
    ],
    created: new Date().toISOString(),
    updated: new Date().toISOString()
  };
};

export default {
  generateDID,
  isValidDID,
  extractPublicKeyFromDID,
  createDIDDocument
};
