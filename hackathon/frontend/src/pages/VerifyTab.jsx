import React, { useState } from 'react';
import { CheckCircle, XCircle, Search } from 'lucide-react';
import { Card, Button, Badge, Alert, CopyableText, LoadingSpinner, JSONDisplay } from '../components/UI';
import { getDIDFromStorage } from '../utils/storage';
import { retrieveFromIPFS, getIPFSMetadata } from '../utils/ipfs';
import { decryptVC } from '../utils/encryption';
import { verifyVC } from '../utils/api';

/**
 * Verify Tab Component
 * Allows users to retrieve credentials from IPFS and verify them
 */
export const VerifyTab = () => {
  const [did, setDid] = useState(null);
  const [cidInput, setCidInput] = useState('');
  const [encryptedVC, setEncryptedVC] = useState(null);
  const [decryptedVC, setDecryptedVC] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [ipfsMetadata, setIpfsMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(0); // 0: input, 1: retrieved, 2: decrypted, 3: verified

  // Load DID from storage on mount
  React.useEffect(() => {
    const storedDID = getDIDFromStorage();
    if (storedDID) {
      setDid(storedDID);
    }
  }, []);

  /**
   * Step 1: Retrieve from IPFS
   */
  const handleRetrieveFromIPFS = async () => {
    try {
      if (!cidInput.trim()) {
        setError('Please enter a CID');
        return;
      }

      setLoading(true);
      setError(null);

      console.log('\n📥 Retrieving credential from IPFS...');
      console.log(`   CID: ${cidInput}`);

      // Retrieve from IPFS
      const encrypted = await retrieveFromIPFS(cidInput);
      setEncryptedVC(encrypted);

      // Get metadata
      const metadata = await getIPFSMetadata(cidInput);
      setIpfsMetadata(metadata);

      setStep(1);
      console.log('✅ Credential retrieved from IPFS');
    } catch (err) {
      const errorMessage = err.message || 'Failed to retrieve from IPFS';
      setError(errorMessage);
      console.error('❌ Error:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 2: Decrypt VC
   */
  const handleDecryptVC = async () => {
    try {
      if (!encryptedVC || !did) {
        setError('Missing encrypted VC or DID');
        return;
      }

      setLoading(true);
      setError(null);

      console.log('\n🔓 Decrypting VC with your private key...');

      // Decrypt using private key
      const decrypted = decryptVC(encryptedVC, did.privateKey);
      setDecryptedVC(decrypted);

      setStep(2);
      console.log('✅ VC decrypted successfully');
    } catch (err) {
      const errorMessage = err.message || 'Failed to decrypt VC. Wrong encryption key or corrupted data.';
      setError(errorMessage);
      console.error('❌ Error:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 3: Verify VC Signature
   */
  const handleVerifyVC = async () => {
    try {
      if (!decryptedVC) {
        setError('No decrypted VC to verify');
        return;
      }

      setLoading(true);
      setError(null);

      console.log('\n🔐 Verifying VC signature...');

      // Verify with backend
      const result = await verifyVC(decryptedVC, decryptedVC.issuer.split(':')[2]);
      setVerificationResult(result);

      setStep(3);
      console.log('✅ Verification complete');
    } catch (err) {
      const errorMessage = err.message || 'Failed to verify VC';
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
    setCidInput('');
    setEncryptedVC(null);
    setDecryptedVC(null);
    setVerificationResult(null);
    setIpfsMetadata(null);
    setStep(0);
    setError(null);
  };

  if (!did) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">✅ Verify Credentials</h2>
        <Alert variant="warning" title="⚠️ Create DID First">
          You need to create a DID before you can verify credentials.
          Please go to the Identity tab first.
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">✅ Verify Credentials</h2>
        <p className="text-gray-600">
          Retrieve encrypted credentials from IPFS, decrypt them, and verify their authenticity.
        </p>
      </div>

      {/* Step Indicator */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: 'Retrieve from IPFS', done: step > 0 },
            { num: 2, label: 'Decrypt', done: step > 1 },
            { num: 3, label: 'Verify Signature', done: step > 2 }
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

      {/* Step 1: Input CID */}
      {step === 0 && (
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Step 1: Enter CID</h3>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              IPFS Content Identifier (CID)
            </label>
            <input
              type="text"
              value={cidInput}
              onChange={(e) => setCidInput(e.target.value)}
              placeholder="Qmxxx..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm"
            />
            <p className="text-xs text-gray-600 mt-1">
              Paste the CID from a credential you received
            </p>
          </div>

          <Button
            onClick={handleRetrieveFromIPFS}
            loading={loading}
            className="w-full"
          >
            <Search className="w-5 h-5" />
            Retrieve from IPFS
          </Button>
        </Card>
      )}

      {/* Step 2: Retrieved & Metadata */}
      {step >= 1 && encryptedVC && (
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Step 2: Retrieved from IPFS</h3>

          <Alert variant="success">
            ✅ Encrypted credential retrieved from IPFS!
          </Alert>

          {ipfsMetadata && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-semibold text-gray-900 mb-3">IPFS Metadata</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Upload Time:</span>
                  <span className="font-medium">
                    {new Date(ipfsMetadata.uploadedAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Size:</span>
                  <span className="font-medium">{ipfsMetadata.size} bytes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Encryption:</span>
                  <span className="font-medium">{ipfsMetadata.encryptionMethod}</span>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <Button onClick={handleDecryptVC} loading={loading} className="w-full">
              🔓 Decrypt VC
            </Button>
          )}

          {step > 1 && (
            <Badge variant="success" className="inline-block">
              ✅ Decrypted
            </Badge>
          )}
        </Card>
      )}

      {/* Step 3: Decrypted VC */}
      {step >= 2 && decryptedVC && (
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Step 3: Decrypted Credential</h3>

          <Alert variant="success">
            ✅ VC successfully decrypted!
          </Alert>

          <JSONDisplay title="Verifiable Credential" data={decryptedVC} />

          {step === 2 && (
            <Button onClick={handleVerifyVC} loading={loading} className="w-full">
              <CheckCircle className="w-5 h-5" />
              Verify Signature
            </Button>
          )}

          {step > 2 && (
            <Badge variant="success" className="inline-block">
              ✅ Signature Verified
            </Badge>
          )}
        </Card>
      )}

      {/* Step 4: Verification Result */}
      {step === 3 && verificationResult && (
        <Card
          className={`p-6 space-y-4 ${
            verificationResult.valid
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            {verificationResult.valid ? (
              <>
                <CheckCircle className="w-8 h-8 text-green-600" />
                <h3 className="text-lg font-semibold text-green-900">✅ Credential Valid!</h3>
              </>
            ) : (
              <>
                <XCircle className="w-8 h-8 text-red-600" />
                <h3 className="text-lg font-semibold text-red-900">❌ Credential Invalid</h3>
              </>
            )}
          </div>

          <Alert variant={verificationResult.valid ? 'success' : 'danger'}>
            {verificationResult.valid
              ? 'This credential has been verified as authentic and has not been tampered with.'
              : 'This credential failed verification. It may have been tampered with or the issuer is not recognized.'}
          </Alert>

          {/* Verification Details */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
            <h4 className="font-semibold text-gray-900">Verification Details</h4>

            <div>
              <p className="text-sm text-gray-600">Credential Type</p>
              <p className="text-sm font-medium text-gray-900">
                {verificationResult.credentialType?.join(', ')}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Issuer</p>
              <p className="text-sm font-medium text-gray-900 break-all">
                {verificationResult.issuer}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Issuance Date</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(verificationResult.issuanceDate).toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Holder (Subject)</p>
              <p className="text-sm font-medium text-gray-900 break-all">
                {verificationResult.credentialSubject?.id}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Proof Type</p>
              <p className="text-sm font-medium text-gray-900">
                {verificationResult.proofDetails?.type}
              </p>
            </div>

            {verificationResult.verification && (
              <div>
                <p className="text-sm text-gray-600">Signature Valid</p>
                <Badge
                  variant={verificationResult.verification.signatureValid ? 'success' : 'danger'}
                >
                  {verificationResult.verification.signatureValid ? '✅ Valid' : '❌ Invalid'}
                </Badge>
              </div>
            )}
          </div>

          {/* Credential Subject Data */}
          {verificationResult.credentialSubject?.degree && (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">Degree Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Degree Type:</span>
                  <span className="font-medium">
                    {verificationResult.credentialSubject.degree.type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">
                    {verificationResult.credentialSubject.degree.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">University:</span>
                  <span className="font-medium">
                    {verificationResult.credentialSubject.degree.university}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Graduation Year:</span>
                  <span className="font-medium">
                    {verificationResult.credentialSubject.degree.graduationYear}
                  </span>
                </div>
              </div>
            </div>
          )}

          <Button onClick={handleReset} variant="secondary" className="w-full">
            Verify Another Credential
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

export default VerifyTab;
