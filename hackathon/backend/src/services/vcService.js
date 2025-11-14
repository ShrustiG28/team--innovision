import { ethers } from 'ethers';
import CryptoJS from 'crypto-js';

/**
 * Verifiable Credential (VC) Service
 * Handles creation, signing, and verification of W3C-compliant Verifiable Credentials
 */

// Simulated issuer DID and keys
// In production, this would be managed securely
const ISSUER_PRIVATE_KEY = '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
const issuerWallet = new ethers.Wallet(ISSUER_PRIVATE_KEY);
const ISSUER_DID = `did:ethr:${issuerWallet.address}`;

console.log(`\n📋 Issuer DID initialized: ${ISSUER_DID}`);

/**
 * Create a W3C-compliant Verifiable Credential
 * Follows the W3C Verifiable Credentials Data Model 1.0 specification
 *
 * @param {string} holderDID - The DID of the credential holder
 * @param {string} holderPublicKey - The public key of the holder
 * @param {Object} credentialSubject - The credential data (degree, etc.)
 * @returns {Object} The unsigned VC object
 */
export const createVerifiableCredential = (holderDID, holderPublicKey, credentialSubject = {}) => {
  // Default credential subject with degree information
  const defaultSubject = {
    id: holderDID,
    degree: {
      type: 'BachelorDegree',
      name: 'Bachelor of Technology in Computer Science',
      university: 'Example Tech University',
      graduationYear: 2025
    }
  };

  const subject = { ...defaultSubject, ...credentialSubject };

  // W3C VC structure
  const vc = {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://www.w3.org/2018/credentials/examples/v1'
    ],
    type: ['VerifiableCredential', 'DegreeCredential'],
    issuer: ISSUER_DID,
    issuanceDate: new Date().toISOString(),
    credentialSubject: subject,
    // Proof will be added after signing
    proof: null
  };

  return vc;
};

/**
 * Sign a Verifiable Credential using the issuer's private key
 * Creates a JWT-like signature to ensure authenticity
 *
 * @param {Object} vc - The unsigned VC object
 * @returns {Object} The signed VC with proof
 */
export const signVerifiableCredential = (vc) => {
  try {
    // Create a copy to preserve original
    const signedVC = { ...vc };

    // Stringify the VC for signing (excluding the proof field)
    const { proof, ...vcData } = signedVC;
    const vcString = JSON.stringify(vcData);

    // Sign using the issuer's private key
    // Using ethers to sign the message hash
    const messageHash = ethers.id(vcString); // Creates keccak256 hash
    const signature = issuerWallet.signingKey.sign(messageHash).serialized;

    // Add proof to the VC
    signedVC.proof = {
      type: 'EcdsaSecp256k1Signature2019',
      created: new Date().toISOString(),
      verificationMethod: `${ISSUER_DID}#keys-1`,
      signatureValue: signature,
      // Store the hash for verification
      dataHash: messageHash
    };

    console.log('\n✅ VC Signed Successfully');
    console.log(`   Issuer: ${ISSUER_DID}`);
    console.log(`   Signature: ${signature.substring(0, 20)}...`);

    return signedVC;
  } catch (error) {
    console.error('❌ Error signing VC:', error.message);
    throw error;
  }
};

/**
 * Verify the signature of a Verifiable Credential
 * Checks that the VC was signed by the issuer and hasn't been tampered with
 *
 * @param {Object} signedVC - The signed VC object
 * @param {string} issuerPublicKey - The issuer's public key (address)
 * @returns {Object} Verification result with status and details
 */
export const verifyVCSignature = (signedVC, issuerPublicKey) => {
  try {
    if (!signedVC.proof) {
      return {
        valid: false,
        reason: 'No proof found in VC'
      };
    }

    // Reconstruct the data that was signed
    const { proof, ...vcData } = signedVC;
    const vcString = JSON.stringify(vcData);
    const messageHash = ethers.id(vcString);

    // Recover the signer's address from the signature
    const recoveredAddress = ethers.recoverAddress(messageHash, signedVC.proof.signatureValue);

    // Check if the recovered address matches the issuer's public key
    const isValid = recoveredAddress.toLowerCase() === issuerPublicKey.toLowerCase();

    console.log('\n✅ VC Verification Check');
    console.log(`   Expected Issuer: ${issuerPublicKey}`);
    console.log(`   Recovered Signer: ${recoveredAddress}`);
    console.log(`   Signature Valid: ${isValid ? '✅ YES' : '❌ NO'}`);

    return {
      valid: isValid,
      issuer: signedVC.issuer,
      recoveredAddress,
      verificationMethod: signedVC.proof.verificationMethod,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error verifying VC:', error.message);
    return {
      valid: false,
      reason: `Verification failed: ${error.message}`
    };
  }
};

/**
 * Create a JWT representation of the VC
 * For easy transmission and storage
 *
 * @param {Object} vc - The VC object (signed or unsigned)
 * @returns {string} Base64-encoded JWT payload
 */
export const createVCToken = (vc) => {
  // Simple JWT-like encoding (not a real JWT, just for demo)
  const header = {
    alg: 'ES256K', // ECDSA with secp256k1
    typ: 'JWT'
  };

  const payload = vc;

  const headerEncoded = Buffer.from(JSON.stringify(header)).toString('base64');
  const payloadEncoded = Buffer.from(JSON.stringify(payload)).toString('base64');

  return `${headerEncoded}.${payloadEncoded}`;
};

/**
 * Decode a VC token
 *
 * @param {string} token - The VC token
 * @returns {Object} Decoded VC object
 */
export const decodeVCToken = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) {
      throw new Error('Invalid token format');
    }

    const payloadEncoded = parts[1];
    const payload = JSON.parse(Buffer.from(payloadEncoded, 'base64').toString());

    return payload;
  } catch (error) {
    console.error('❌ Error decoding VC token:', error.message);
    throw error;
  }
};

/**
 * Get issuer's public key
 * In a real system, this would be looked up via DID resolution
 *
 * @returns {string} Issuer's public key
 */
export const getIssuerPublicKey = () => {
  return issuerWallet.address;
};

/**
 * Get issuer's DID
 *
 * @returns {string} Issuer's DID
 */
export const getIssuerDID = () => {
  return ISSUER_DID;
};

export default {
  createVerifiableCredential,
  signVerifiableCredential,
  verifyVCSignature,
  createVCToken,
  decodeVCToken,
  getIssuerPublicKey,
  getIssuerDID
};
