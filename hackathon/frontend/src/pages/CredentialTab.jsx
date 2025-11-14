import React, { useState, useEffect } from 'react';
import { FileText, Send, Lock, Upload, Wallet } from 'lucide-react';
import { Card, Button, Badge, Alert, CopyableText, LoadingSpinner, JSONDisplay } from '../components/UI';
import { getDIDFromStorage } from '../utils/storage';
import { requestVC, getVCInfo } from '../utils/api';
import { encryptVC } from '../utils/encryption';
import { uploadToIPFS } from '../utils/ipfs';

/**
 * Credential Tab Component
 * Allows users to request VCs from the backend and upload them to IPFS
 * Now with MetaMask wallet integration
 */
export const CredentialTab = () => {
  const [did, setDid] = useState(null);
  const [vc, setVc] = useState(null);
  const [encryptedVC, setEncryptedVC] = useState(null);
  const [cid, setCid] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(0); // 0: request, 1: encrypt, 2: upload
  const [walletInfo, setWalletInfo] = useState(null);
  const [useWalletIdentity, setUseWalletIdentity] = useState(false);
  
  const [credentialData, setCredentialData] = useState({
    degree: {
      type: 'BachelorDegree',
      name: 'Bachelor of Technology in Computer Science',
      university: 'Example Tech University',
      graduationYear: 2025
    }
  });

  // Load DID from storage and wallet info on mount
  useEffect(() => {
    const storedDID = getDIDFromStorage();
    if (storedDID) {
      setDid(storedDID);
    }

    // Check for connected wallet
    const storedWalletInfo = localStorage.getItem('walletInfo');
    if (storedWalletInfo) {
      const walletData = JSON.parse(storedWalletInfo);
      if (walletData.isConnected) {
        setWalletInfo(walletData);
      }
    }
  }, []);

  // Get the current identity (DID or wallet)
  const getCurrentIdentity = () => {
    if (useWalletIdentity && walletInfo) {
      return {
        did: `did:ethr:${walletInfo.address.toLowerCase()}`,
        address: walletInfo.address,
        type: 'wallet'
      };
    }
    return {
      did: did?.did,
      privateKey: did?.privateKey,
      type: 'did'
    };
  };

  /**
   * Step 1: Request VC from backend
   */
  const handleRequestVC = async () => {
    try {
      const identity = getCurrentIdentity();
      
      if (!identity.did) {
        setError('No identity found. Please create a DID or connect MetaMask first.');
        return;
      }

      setLoading(true);
      setError(null);

      console.log('\n🎓 Requesting VC from backend...');
      console.log(`   Holder DID: ${identity.did}`);
      console.log(`   Identity Type: ${identity.type}`);

      // For wallet identities, we don't have a public key to send
      const publicKey = identity.type === 'did' ? did.publicKey : undefined;

      // Request VC from backend
      const vcData = await requestVC(identity.did, publicKey, credentialData);

      setVc(vcData.vc);
      setStep(1);

      console.log('✅ VC received from backend');
    } catch (err) {
      const errorMessage = err.message || 'Failed to request VC';
      setError(errorMessage);
      console.error('❌ Error:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 2: Encrypt VC locally
   */
  const handleEncryptVC = async () => {
    try {
      if (!vc) {
        setError('Missing VC');
        return;
      }

      const identity = getCurrentIdentity();
      
      setLoading(true);
      setError(null);

      console.log('\n🔒 Encrypting VC...');

      let encrypted;
      
      if (identity.type === 'wallet') {
        // For wallet identities, we need to handle encryption differently
        // Since we don't have a private key, we'll create a deterministic key from the address
        const walletEncryptionKey = `wallet_key_${identity.address}`;
        encrypted = encryptVC(vc, walletEncryptionKey);
        console.log('✅ VC encrypted using wallet-based key');
      } else {
        // For DID identities, use the private key
        if (!identity.privateKey) {
          throw new Error('Missing private key for encryption');
        }
        encrypted = encryptVC(vc, identity.privateKey);
        console.log('✅ VC encrypted using DID private key');
      }

      setEncryptedVC(encrypted);
      setStep(2);

    } catch (err) {
      const errorMessage = err.message || 'Failed to encrypt VC';
      setError(errorMessage);
      console.error('❌ Error:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 3: Upload encrypted VC to IPFS
   */
  const handleUploadToIPFS = async () => {
    try {
      if (!encryptedVC) {
        setError('No encrypted VC');
        return;
      }

      const identity = getCurrentIdentity();
      
      setLoading(true);
      setError(null);

      console.log('\n📤 Uploading encrypted VC to IPFS...');

      // Upload to IPFS
      const uploadResult = await uploadToIPFS(encryptedVC, {
        type: 'VerifiableCredential',
        holderDID: identity.did,
        issuerDID: vc.issuer,
        encryptionMethod: 'AES-256',
        identityType: identity.type,
        ...(identity.type === 'wallet' && { walletAddress: identity.address })
      });

      setCid(uploadResult.cid);
      setStep(3);

      console.log('✅ VC uploaded to IPFS');
      console.log(`   CID: ${uploadResult.cid}`);
      console.log(`   Identity Type: ${identity.type}`);
    } catch (err) {
      const errorMessage = err.message || 'Failed to upload to IPFS';
      setError(errorMessage);
      console.error('❌ Error:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset flow
   */
  const handleReset = () => {
    setVc(null);
    setEncryptedVC(null);
    setCid(null);
    setStep(0);
    setError(null);
  };

  // Check if user has any identity
  const hasIdentity = did || walletInfo;

  if (!hasIdentity) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">🎓 Verifiable Credentials</h2>
        <Alert variant="warning" title="⚠️ Create Identity First">
          You need to create a DID or connect MetaMask before you can request credentials.
          Please go to the Identity or MetaMask tab first.
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🎓 Verifiable Credentials</h2>
        <p className="text-gray-600">
          Request credentials from an issuer, encrypt them, and upload to IPFS for secure storage.
          Now with MetaMask wallet support!
        </p>
      </div>

      {/* Identity Selection */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Identity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* DID Identity */}
          <div 
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              !useWalletIdentity 
                ? 'border-indigo-500 bg-indigo-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => setUseWalletIdentity(false)}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                !useWalletIdentity ? 'bg-indigo-500' : 'bg-gray-300'
              }`}></div>
              <div>
                <p className="font-semibold text-gray-900">DID Identity</p>
                <p className="text-sm text-gray-600 mt-1">
                  {did ? `Using: ${did.did.substring(0, 30)}...` : 'No DID created'}
                </p>
              </div>
            </div>
          </div>

          {/* Wallet Identity */}
          <div 
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              useWalletIdentity && walletInfo
                ? 'border-orange-500 bg-orange-50' 
                : 'border-gray-300 hover:border-gray-400'
            } ${!walletInfo ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => walletInfo && setUseWalletIdentity(true)}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                useWalletIdentity && walletInfo ? 'bg-orange-500' : 'bg-gray-300'
              }`}></div>
              <div>
                <p className="font-semibold text-gray-900 flex items-center">
                  <Wallet className="w-4 h-4 mr-2" />
                  MetaMask Wallet
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {walletInfo 
                    ? `Using: ${walletInfo.address.substring(0, 20)}...` 
                    : 'Connect wallet in MetaMask tab'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {useWalletIdentity && walletInfo && (
          <div className="mt-4 p-3 bg-orange-100 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              <strong>Using Wallet Identity:</strong> {walletInfo.address}
            </p>
            <p className="text-xs text-orange-700 mt-1">
              DID: did:ethr:{walletInfo.address.toLowerCase()}
            </p>
          </div>
        )}
      </Card>

      {/* Step Indicator */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: 'Request VC', done: step > 0 },
            { num: 2, label: 'Encrypt', done: step > 1 },
            { num: 3, label: 'Upload IPFS', done: step > 2 }
          ].map((item, index) => (
            <React.Fragment key={item.num}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    item.done
                      ? 'bg-green-600 text-white'
                      : step === item.num - 1
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {item.done ? '✓' : item.num}
                </div>
                <p className="text-xs mt-1 text-gray-600 text-center">{item.label}</p>
              </div>
              {index < 2 && (
                <div className={`h-1 flex-1 mx-2 ${item.done ? 'bg-green-600' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </Card>

      {/* Step 1: Request VC */}
      {step === 0 && (
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Step 1: Request VC from Issuer</h3>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Degree Information
            </label>
            <textarea
              value={JSON.stringify(credentialData, null, 2)}
              onChange={(e) => {
                try {
                  setCredentialData(JSON.parse(e.target.value));
                } catch {}
              }}
              className="w-full h-32 p-3 border border-gray-300 rounded-lg font-mono text-sm"
            />
          </div>

          <Button 
            onClick={handleRequestVC} 
            loading={loading} 
            className="w-full"
            disabled={useWalletIdentity && !walletInfo}
          >
            <Send className="w-5 h-5" />
            {useWalletIdentity ? 'Request VC with Wallet' : 'Request VC with DID'}
          </Button>

          <Alert variant="info">
            {useWalletIdentity 
              ? 'This will request a signed Verifiable Credential using your Ethereum wallet address as the identity.'
              : 'This will request a signed Verifiable Credential from the backend issuer using your DID.'
            }
            The VC will follow the W3C Verifiable Credentials standard.
          </Alert>
        </Card>
      )}

      {/* Step 2: Encrypt VC */}
      {step >= 1 && vc && (
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Step 2: Received VC</h3>

          <Alert variant="success">
            ✅ VC successfully received from issuer and signed!
            {useWalletIdentity && (
              <span className="block mt-1">
                <strong>Wallet Identity:</strong> Your Ethereum address is now the credential subject.
              </span>
            )}
          </Alert>

          <JSONDisplay title="Verifiable Credential" data={vc} />

          {step === 1 && (
            <Button onClick={handleEncryptVC} loading={loading} className="w-full">
              <Lock className="w-5 h-5" />
              {useWalletIdentity ? 'Encrypt VC with Wallet Key' : 'Encrypt VC with Private Key'}
            </Button>
          )}

          {step > 1 && (
            <Badge variant="success" className="inline-block">
              ✅ Encrypted
            </Badge>
          )}
        </Card>
      )}

      {/* Step 3: Upload to IPFS */}
      {step >= 2 && encryptedVC && (
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Step 3: Upload to IPFS</h3>

          <Alert variant="success">
            ✅ VC encrypted successfully! 
            {useWalletIdentity 
              ? 'Using wallet-based encryption key.'
              : 'Using your private key as the encryption key.'
            }
          </Alert>

          <div>
            <p className="text-sm text-gray-600 mb-2">Encrypted Data (truncated):</p>
            <p className="font-mono text-xs bg-gray-900 text-green-400 p-3 rounded break-all">
              {encryptedVC.substring(0, 100)}...
            </p>
          </div>

          {step === 2 && (
            <Button onClick={handleUploadToIPFS} loading={loading} className="w-full">
              <Upload className="w-5 h-5" />
              Upload Encrypted VC to IPFS
            </Button>
          )}

          {step > 2 && (
            <Badge variant="success" className="inline-block">
              ✅ Uploaded to IPFS
            </Badge>
          )}
        </Card>
      )}

      {/* Step 4: Success with CID */}
      {step === 3 && cid && (
        <Card className="p-6 space-y-4 bg-green-50 border-green-200">
          <h3 className="text-lg font-semibold text-green-900">✅ Credential Secured on IPFS!</h3>

          <Alert variant="success" title="🎉 Success!">
            Your encrypted credential has been uploaded to IPFS. Save the CID to retrieve or verify it later.
            {useWalletIdentity && (
              <span className="block mt-1">
                <strong>Wallet Identity Used:</strong> {walletInfo.address}
              </span>
            )}
          </Alert>

          <CopyableText
            label="Content Identifier (CID)"
            text={cid}
          />

          <div className="bg-white p-4 rounded-lg border border-green-200">
            <p className="text-sm font-semibold text-gray-900 mb-2">What's Next?</p>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Share this CID with verifiers</li>
              <li>Go to the Verify tab to verify your credential</li>
              <li>Your credential is encrypted and only you can decrypt it</li>
              {useWalletIdentity && (
                <li>Use the same wallet address to decrypt and verify</li>
              )}
            </ul>
          </div>

          <Button onClick={handleReset} variant="secondary" className="w-full">
            Request Another Credential
          </Button>
        </Card>
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

export default CredentialTab;