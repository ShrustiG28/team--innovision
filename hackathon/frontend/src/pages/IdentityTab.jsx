import React, { useState, useEffect } from 'react';
import { Key, Plus, Trash2, Wallet } from 'lucide-react';
import { Card, Button, Badge, Alert, CopyableText, LoadingSpinner } from '../components/UI';
import { createDID } from '../utils/api';
import { saveDIDToStorage, getDIDFromStorage, clearDID } from '../utils/storage';

/**
 * Identity Tab Component
 * Allows users to create and manage their DID (Decentralized Identifier)
 */
export const IdentityTab = ({ onShowMetaMaskTab }) => {
  const [did, setDid] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load DID from storage on mount
  useEffect(() => {
    const storedDID = getDIDFromStorage();
    if (storedDID) {
      setDid(storedDID);
    }
  }, []);

  /**
   * Handle DID creation
   */
  const handleCreateDID = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('\n🚀 Creating DID...');
      
      // Request DID from backend
      const didData = await createDID();

      // Save to local storage
      saveDIDToStorage(didData);

      // Update state
      setDid(didData);

      console.log('✅ DID created and stored successfully');
    } catch (err) {
      const errorMessage = err.message || 'Failed to create DID';
      setError(errorMessage);
      console.error('❌ Error:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle redirect to MetaMaskTab using props callback
   */
  const handleMetaMaskTab = () => {
    console.log('🔗 Redirecting to MetaMask wallet integration...');
    if (onShowMetaMaskTab) {
      onShowMetaMaskTab();
    } else {
      // Fallback: show alert if callback not provided
      alert('MetaMask integration would open here. Please implement the navigation in your parent component.');
    }
  };

  /**
   * Handle DID deletion
   */
  const handleDeleteDID = () => {
    if (window.confirm('⚠️ Are you sure? This will delete your DID and all associated data.')) {
      clearDID();
      setDid(null);
      setError(null);
      console.log('✅ DID deleted');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🆔 Digital Identity</h2>
        <p className="text-gray-600">
          Create and manage your Decentralized Identifier (DID) for self-sovereign identity.
        </p>
      </div>

      {/* No DID State */}
      {!did ? (
        <Card className="p-8 text-center">
          <Key className="w-16 h-16 text-indigo-600 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Identity Created</h3>
          <p className="text-gray-600 mb-6">
            Click the button below to generate your unique DID and cryptographic keys.
            Your private key will be stored securely in your browser.
          </p>
          <div className="flex flex-col gap-3 max-w-xs mx-auto">
            <Button
              onClick={handleCreateDID}
              loading={loading}
              className="w-full"
            >
              <Plus className="w-5 h-5" />
              Create DID locally
            </Button>
            <Button
              onClick={handleMetaMaskTab}
              variant="secondary"
              className="w-full"
            >
              <Wallet className="w-5 h-5" />
              Create DID using wallet
            </Button>
          </div>
        </Card>
      ) : (
        /* DID Created State */
        <>
          {/* Success Alert */}
          <Alert variant="success" title="✅ Identity Created!">
            Your DID has been created and is stored securely in your browser's local storage.
          </Alert>

          {/* DID Information */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Your DID Details</h3>
              <Badge variant="success">Active</Badge>
            </div>

            <div className="space-y-4">
              {/* DID */}
              <CopyableText
                label="Decentralized Identifier (DID)"
                text={did.did}
              />

              {/* Public Key */}
              <CopyableText
                label="Public Key (Address)"
                text={did.publicKey}
                truncate={true}
              />

              {/* Private Key Warning */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2">🔐 Private Key (Confidential)</h4>
                <p className="text-sm text-red-800 mb-3">
                  ⚠️ This is your private key. Never share it. It's stored in your browser's local storage.
                </p>
                <CopyableText
                  label="Private Key"
                  text={did.privateKey}
                  truncate={true}
                />
              </div>

              {/* Created At */}
              <div>
                <p className="text-xs text-gray-600 mb-1">Created At</p>
                <p className="text-sm text-gray-900">
                  {new Date(did.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          {/* DID Document */}
          {did.didDocument && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">DID Document (W3C)</h3>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs font-mono">
                {JSON.stringify(did.didDocument, null, 2)}
              </pre>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setDid(null)}
            >
              Create New DID
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteDID}
            >
              <Trash2 className="w-5 h-5" />
              Delete DID
            </Button>
          </div>
        </>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" title="❌ Error">
          {error}
        </Alert>
      )}
    </div>
  );
};

export default IdentityTab;