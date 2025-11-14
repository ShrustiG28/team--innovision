import CryptoJS from 'crypto-js';

/**
 * Encryption/Decryption Utilities
 * Uses AES encryption with a key derived from the user's private key
 */

/**
 * Derive an encryption key from the private key
 * @param {string} privateKey - The user's private key
 * @returns {string} Encryption key
 */
export const deriveEncryptionKey = (privateKey) => {
  // Create a hash of the private key to use as encryption key
  const key = CryptoJS.SHA256(privateKey).toString();
  return key;
};

/**
 * Encrypt data using AES with the derived key
 * @param {Object|string} data - Data to encrypt
 * @param {string} privateKey - User's private key to derive encryption key
 * @returns {string} Encrypted data
 */
export const encryptData = (data, privateKey) => {
  try {
    const key = deriveEncryptionKey(privateKey);
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
    
    const encrypted = CryptoJS.AES.encrypt(jsonString, key).toString();
    
    console.log('✅ Data encrypted successfully');
    return encrypted;
  } catch (error) {
    console.error('❌ Encryption error:', error);
    throw error;
  }
};

/**
 * Decrypt data using AES with the derived key
 * @param {string} encryptedData - Encrypted data
 * @param {string} privateKey - User's private key to derive encryption key
 * @param {boolean} parseJSON - Whether to parse result as JSON
 * @returns {Object|string} Decrypted data
 */
export const decryptData = (encryptedData, privateKey, parseJSON = true) => {
  try {
    const key = deriveEncryptionKey(privateKey);
    
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key).toString(CryptoJS.enc.Utf8);
    
    console.log('✅ Data decrypted successfully');
    
    if (parseJSON) {
      return JSON.parse(decrypted);
    }
    return decrypted;
  } catch (error) {
    console.error('❌ Decryption error:', error);
    throw error;
  }
};

/**
 * Encrypt a VC for IPFS upload
 * @param {Object} vc - The VC to encrypt
 * @param {string} privateKey - User's private key
 * @returns {string} Encrypted VC
 */
export const encryptVC = (vc, privateKey) => {
  return encryptData(vc, privateKey);
};

/**
 * Decrypt a VC retrieved from IPFS
 * @param {string} encryptedVC - The encrypted VC
 * @param {string} privateKey - User's private key
 * @returns {Object} Decrypted VC
 */
export const decryptVC = (encryptedVC, privateKey) => {
  return decryptData(encryptedVC, privateKey, true);
};

export default {
  deriveEncryptionKey,
  encryptData,
  decryptData,
  encryptVC,
  decryptVC
};
