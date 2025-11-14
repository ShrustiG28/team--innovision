/**
 * API Client for communicating with the backend
 */

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Create a DID via the backend
 * @returns {Promise<Object>} DID data with public and private keys
 */
export const createDID = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/create-did`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('❌ Error creating DID:', error);
    throw error;
  }
};

/**
 * Request a Verifiable Credential from the backend
 * @param {string} holderDID - The holder's DID
 * @param {string} holderPublicKey - The holder's public key
 * @param {Object} credentialSubject - Optional credential data
 * @returns {Promise<Object>} Signed VC
 */
export const requestVC = async (holderDID, holderPublicKey, credentialSubject = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/issue-vc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        holderDID,
        holderPublicKey,
        credentialSubject
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('❌ Error requesting VC:', error);
    throw error;
  }
};

/**
 * Verify a Verifiable Credential with the backend
 * @param {Object} vc - The VC to verify
 * @param {string} issuerPublicKey - The issuer's public key
 * @returns {Promise<Object>} Verification result
 */
export const verifyVC = async (vc, issuerPublicKey) => {
  try {
    const response = await fetch(`${API_BASE_URL}/verify-vc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        vc,
        issuerPublicKey
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('❌ Error verifying VC:', error);
    throw error;
  }
};

/**
 * Get VC information
 * @param {Object} vc - The VC
 * @returns {Promise<Object>} VC info
 */
export const getVCInfo = async (vc) => {
  try {
    const response = await fetch(`${API_BASE_URL}/vc-info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ vc })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('❌ Error getting VC info:', error);
    throw error;
  }
};

/**
 * Get DID information
 * @param {string} did - The DID
 * @returns {Promise<Object>} DID info
 */
export const getDIDInfo = async (did) => {
  try {
    const response = await fetch(`${API_BASE_URL}/did-info/${encodeURIComponent(did)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('❌ Error getting DID info:', error);
    throw error;
  }
};

export default {
  createDID,
  requestVC,
  verifyVC,
  getVCInfo,
  getDIDInfo
};
