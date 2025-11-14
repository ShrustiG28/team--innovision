/**
 * Local Storage Utilities
 * Handles secure storage of user DIDs and private keys
 */

const STORAGE_KEYS = {
  DID: 'user_did',
  PRIVATE_KEY: 'user_private_key',
  PUBLIC_KEY: 'user_public_key',
  CREDENTIALS: 'user_credentials',
  DID_DOCUMENT: 'user_did_document'
};

/**
 * Save user DID and keys to local storage
 * @param {Object} didData - Object containing did, publicKey, privateKey
 */
export const saveDIDToStorage = (didData) => {
  try {
    localStorage.setItem(STORAGE_KEYS.DID, didData.did);
    localStorage.setItem(STORAGE_KEYS.PUBLIC_KEY, didData.publicKey);
    localStorage.setItem(STORAGE_KEYS.PRIVATE_KEY, didData.privateKey);
    localStorage.setItem(STORAGE_KEYS.DID_DOCUMENT, JSON.stringify(didData.didDocument));
    console.log('✅ DID and keys saved to local storage');
    return true;
  } catch (error) {
    console.error('❌ Error saving DID:', error);
    return false;
  }
};

/**
 * Retrieve user DID from local storage
 * @returns {Object|null} User's DID data or null
 */
export const getDIDFromStorage = () => {
  try {
    const did = localStorage.getItem(STORAGE_KEYS.DID);
    const publicKey = localStorage.getItem(STORAGE_KEYS.PUBLIC_KEY);
    const privateKey = localStorage.getItem(STORAGE_KEYS.PRIVATE_KEY);
    const didDocument = localStorage.getItem(STORAGE_KEYS.DID_DOCUMENT);

    if (!did || !publicKey || !privateKey) {
      return null;
    }

    return {
      did,
      publicKey,
      privateKey,
      didDocument: didDocument ? JSON.parse(didDocument) : null
    };
  } catch (error) {
    console.error('❌ Error retrieving DID:', error);
    return null;
  }
};

/**
 * Check if user has a DID
 * @returns {boolean}
 */
export const hasDID = () => {
  return !!localStorage.getItem(STORAGE_KEYS.DID);
};

/**
 * Clear user DID and keys from local storage
 */
export const clearDID = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.DID);
    localStorage.removeItem(STORAGE_KEYS.PUBLIC_KEY);
    localStorage.removeItem(STORAGE_KEYS.PRIVATE_KEY);
    localStorage.removeItem(STORAGE_KEYS.DID_DOCUMENT);
    console.log('✅ DID cleared from local storage');
    return true;
  } catch (error) {
    console.error('❌ Error clearing DID:', error);
    return false;
  }
};

/**
 * Save a credential to local storage
 * @param {Object} credential - The credential to save
 */
export const saveCredential = (credential) => {
  try {
    const credentials = getCredentials();
    credentials.push({
      ...credential,
      savedAt: new Date().toISOString()
    });
    localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(credentials));
    console.log('✅ Credential saved');
    return true;
  } catch (error) {
    console.error('❌ Error saving credential:', error);
    return false;
  }
};

/**
 * Get all stored credentials
 * @returns {Array} Array of credentials
 */
export const getCredentials = () => {
  try {
    const credentials = localStorage.getItem(STORAGE_KEYS.CREDENTIALS);
    return credentials ? JSON.parse(credentials) : [];
  } catch (error) {
    console.error('❌ Error retrieving credentials:', error);
    return [];
  }
};

/**
 * Remove a credential from storage
 * @param {string} cid - The CID of the credential to remove
 */
export const removeCredential = (cid) => {
  try {
    const credentials = getCredentials();
    const filtered = credentials.filter(c => c.cid !== cid);
    localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(filtered));
    console.log('✅ Credential removed');
    return true;
  } catch (error) {
    console.error('❌ Error removing credential:', error);
    return false;
  }
};

export default {
  saveDIDToStorage,
  getDIDFromStorage,
  hasDID,
  clearDID,
  saveCredential,
  getCredentials,
  removeCredential
};
