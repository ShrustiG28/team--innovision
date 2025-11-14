import React, { useState } from 'react';
import { Shield, Wallet, CheckCircle, Link } from 'lucide-react';
import IdentityTab from './pages/IdentityTab';
import CredentialTab from './pages/CredentialTab';
import VerifyTab from './pages/VerifyTab';
import MetaMaskTab from './pages/MetaMaskTab';

/**
 * Main App Component
 * Implements the complete Decentralized Identity & Credential Vault flow
 */
function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [showMetaMaskFromIdentity, setShowMetaMaskFromIdentity] = useState(false);

  // Handler for showing MetaMask tab from Identity tab
  const handleShowMetaMaskTab = () => {
    setActiveTab(3); // Switch to MetaMask tab
    setShowMetaMaskFromIdentity(true);
  };

  // Handler for going back to Identity tab from MetaMask
  const handleShowIdentityTab = () => {
    setActiveTab(0); // Switch back to Identity tab
    setShowMetaMaskFromIdentity(false);
  };

  const tabs = [
    {
      id: 0,
      label: '🆔 Identity',
      icon: Wallet,
      component: () => (
        <IdentityTab 
          onShowMetaMaskTab={handleShowMetaMaskTab}
          showMetaMaskButton={!showMetaMaskFromIdentity}
        />
      )
    },
    {
      id: 1,
      label: '🎓 Credentials',
      icon: Shield,
      component: CredentialTab
    },
    {
      id: 2,
      label: '✅ Verify',
      icon: CheckCircle,
      component: VerifyTab
    },
    {
      id: 3,
      label: '🦊 MetaMask',
      icon: Link,
      component: () => (
        <MetaMaskTab onShowIdentityTab={handleShowIdentityTab} />
      )
    }
  ];

  const ActiveComponent = tabs[activeTab].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🔐</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Decentralized Identity Vault
                </h1>
                <p className="text-sm text-gray-600">
                  Self-Sovereign Identity with DIDs, VCs, IPFS & MetaMask
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">
                Hackathon Demo • November 13, 2025
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === 0) {
                      setShowMetaMaskFromIdentity(false);
                    }
                  }}
                  className={`px-4 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex items-center gap-2 ${
                    isActive
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in">
          <ActiveComponent />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Flow Info */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🔁 System Flow</h3>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Generate your unique DID</li>
                <li>Connect MetaMask wallet</li>
                <li>Request VC from issuer</li>
                <li>Encrypt & upload to IPFS</li>
                <li>Share CID with verifiers</li>
                <li>Verify authenticity</li>
              </ol>
            </div>

            {/* Technology Stack */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🧩 Tech Stack</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ React + Tailwind CSS (Frontend)</li>
                <li>✓ Node.js + Express (Backend)</li>
                <li>✓ Ethers.js + MetaMask (Web3)</li>
                <li>✓ IPFS (Decentralized Storage)</li>
                <li>✓ AES Encryption (CryptoJS)</li>
              </ul>
            </div>

            {/* Key Features */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">✨ Key Features</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ Self-Sovereign Identity</li>
                <li>✓ W3C VC Standard</li>
                <li>✓ MetaMask Integration</li>
                <li>✓ Client-Side Encryption</li>
                <li>✓ Cryptographic Signing</li>
                <li>✓ IPFS Integration</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-8 pt-8">
            <p className="text-sm text-gray-600 text-center">
              Built for hackathon • Demonstrates decentralized identity lifecycle with Web3 integration
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;