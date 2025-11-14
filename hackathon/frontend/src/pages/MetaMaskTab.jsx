import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';

export default function MetaMaskTab() {
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('');
  const [chainId, setChainId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Check if MetaMask is installed
  const checkMetaMask = async () => {
    const provider = await detectEthereumProvider();
    if (provider) {
      setMessage('✅ MetaMask is installed');
      return true;
    } else {
      setMessage('❌ Please install MetaMask to continue');
      return false;
    }
  };

  // Connect to MetaMask
  const connectMetaMask = async () => {
    try {
      setLoading(true);
      setMessage('Connecting to MetaMask...');

      // Check if MetaMask is installed
      const provider = await detectEthereumProvider();
      if (!provider) {
        setMessage('❌ MetaMask is not installed. Please install it first.');
        setLoading(false);
        return;
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        const account = accounts[0];
        setAccount(account);
        setIsConnected(true);

        // Get balance
        const provider = new ethers.BrowserProvider(window.ethereum);
        const balance = await provider.getBalance(account);
        setBalance(ethers.formatEther(balance));

        // Get chain ID
        const network = await provider.getNetwork();
        setChainId(network.chainId.toString());

        setMessage('✅ Successfully connected to MetaMask!');

        // Store wallet info in localStorage
        const walletInfo = {
          address: account,
          chainId: network.chainId.toString(),
          isConnected: true,
          connectedAt: new Date().toISOString()
        };
        localStorage.setItem('walletInfo', JSON.stringify(walletInfo));
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      if (error.code === 4001) {
        setMessage('❌ Connection rejected by user');
      } else {
        setMessage(`❌ Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Disconnect MetaMask
  const disconnectMetaMask = () => {
    setAccount('');
    setBalance('');
    setChainId('');
    setIsConnected(false);
    setMessage('Disconnected from MetaMask');
    localStorage.removeItem('walletInfo');
  };

  // Sign a message (useful for proving ownership)
  const signMessage = async () => {
    try {
      setLoading(true);
      setMessage('Signing message...');

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const message = "I am signing this message to prove I control this address for credential verification.";
      const signature = await signer.signMessage(message);
      
      setMessage(`✅ Message signed! Signature: ${signature.substring(0, 50)}...`);

      // Store signature for later use
      const signedData = {
        message,
        signature,
        address: account,
        signedAt: new Date().toISOString()
      };
      localStorage.setItem('signedVerification', JSON.stringify(signedData));

    } catch (error) {
      console.error('Error signing message:', error);
      setMessage(`❌ Signing failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Create DID from Ethereum address
  const createDIDFromAddress = () => {
    if (!account) return null;
    
    // Create a DID using the ethr method
    const did = `did:ethr:${account.toLowerCase()}`;
    return did;
  };

  // Load stored wallet info on component mount
  useEffect(() => {
    checkMetaMask();
    
    const storedWalletInfo = localStorage.getItem('walletInfo');
    if (storedWalletInfo) {
      const walletInfo = JSON.parse(storedWalletInfo);
      if (walletInfo.isConnected) {
        setAccount(walletInfo.address);
        setIsConnected(true);
        // Note: We don't auto-reconnect, user needs to click connect again
      }
    }
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setMessage('Account changed');
        } else {
          disconnectMetaMask();
        }
      });

      window.ethereum.on('chainChanged', (chainId) => {
        setChainId(parseInt(chainId, 16).toString());
        setMessage('Network changed');
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-orange-500 to-yellow-600 rounded-2xl shadow-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">MetaMask Integration</h1>
            <p className="text-orange-100 opacity-90">
              Connect your Ethereum wallet to manage verifiable credentials
            </p>
          </div>
          <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
            <div className="text-2xl font-bold">🦊</div>
            <div className="text-sm opacity-80">MetaMask</div>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Wallet Connection</h2>
        
        <div className="space-y-4">
          {/* Connection Button */}
          {!isConnected ? (
            <button
              onClick={connectMetaMask}
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg disabled:shadow-none"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Connecting...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-lg">🦊</span>
                  <span className="text-lg">Connect MetaMask</span>
                </div>
              )}
            </button>
          ) : (
            <div className="space-y-4">
              <button
                onClick={disconnectMetaMask}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300"
              >
                Disconnect Wallet
              </button>

              {/* Wallet Info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Status:</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">Connected</span>
                </div>
                
                <div>
                  <span className="font-semibold text-gray-700">Account:</span>
                  <p className="font-mono text-sm text-gray-600 break-all mt-1 bg-white p-2 rounded border">
                    {account}
                  </p>
                </div>

                {balance && (
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Balance:</span>
                    <span className="text-gray-600">{parseFloat(balance).toFixed(4)} ETH</span>
                  </div>
                )}

                {chainId && (
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Chain ID:</span>
                    <span className="text-gray-600">{chainId}</span>
                  </div>
                )}

                {createDIDFromAddress() && (
                  <div>
                    <span className="font-semibold text-gray-700">DID:</span>
                    <p className="font-mono text-sm text-blue-600 break-all mt-1 bg-white p-2 rounded border">
                      {createDIDFromAddress()}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={signMessage}
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-xl transition-colors"
                >
                  {loading ? 'Signing...' : 'Sign Verification Message'}
                </button>

                <button
                  onClick={() => {
                    if (createDIDFromAddress()) {
                      navigator.clipboard.writeText(createDIDFromAddress());
                      setMessage('✅ DID copied to clipboard!');
                    }
                  }}
                  className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-4 rounded-xl transition-colors"
                >
                  Copy DID
                </button>
              </div>
            </div>
          )}

          {/* Status Message */}
          {message && (
            <div className={`rounded-xl p-4 ${
              message.includes('✅') || message.includes('Successfully') 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : message.includes('❌') 
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              <div className="flex items-center space-x-2">
                <span>{message.includes('❌') ? '❌' : message.includes('✅') ? '✅' : 'ℹ️'}</span>
                <span>{message}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Integration with Existing System */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Integration with Credential System</h2>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Use Your Ethereum Address as Identity</h3>
            <p className="text-blue-700 text-sm">
              Once connected, your Ethereum address can be used as a Decentralized Identifier (DID) 
              for creating and verifying credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h4 className="font-semibold text-green-800 mb-2">For Credential Creation</h4>
              <ul className="text-green-700 text-sm space-y-1">
                <li>• Use your Ethereum DID as credential subject</li>
                <li>• Sign credentials with your wallet</li>
                <li>• Prove ownership of your identity</li>
              </ul>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <h4 className="font-semibold text-purple-800 mb-2">For Credential Verification</h4>
              <ul className="text-purple-700 text-sm space-y-1">
                <li>• Verify signatures using your public key</li>
                <li>• Prove you control the DID</li>
                <li>• Interact with blockchain-based verifiers</li>
              </ul>
            </div>
          </div>

          {isConnected && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">Next Steps</h4>
              <p className="text-yellow-700 text-sm">
                Your Ethereum identity is ready! You can now:
              </p>
              <ul className="text-yellow-700 text-sm mt-2 space-y-1">
                <li>• Go to the Credentials tab to issue credentials to your DID</li>
                <li>• Use the Verify tab to check credential authenticity</li>
                <li>• Sign messages to prove identity ownership</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-100 border-2 border-orange-200 rounded-2xl p-6 shadow-lg">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white text-xl flex-shrink-0">
            ℹ️
          </div>
          <div>
            <h3 className="font-bold text-orange-900 text-lg mb-3">About MetaMask Integration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs">1</div>
                  <span className="text-orange-800 font-medium">Decentralized Identity</span>
                </div>
                <p className="text-orange-700 text-sm">Your Ethereum address becomes your global identifier</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">2</div>
                  <span className="text-orange-800 font-medium">Cryptographic Proof</span>
                </div>
                <p className="text-orange-700 text-sm">Sign messages to prove you control your identity</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">3</div>
                  <span className="text-orange-800 font-medium">Interoperability</span>
                </div>
                <p className="text-orange-700 text-sm">Use your identity across different applications</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs">4</div>
                  <span className="text-orange-800 font-medium">Self-Sovereignty</span>
                </div>
                <p className="text-orange-700 text-sm">You control your identity, not any central authority</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}