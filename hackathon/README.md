# 🔐 Decentralized Digital Identity & Credential Vault

A complete full-stack implementation demonstrating self-sovereign identity using DIDs (Decentralized Identifiers), Verifiable Credentials (VCs), and IPFS for secure decentralized storage.

## 🎯 Overview

This hackathon-ready prototype visually and technically demonstrates:

- **How users can own and control their digital identities (DIDs)**
- **How issuers can issue verifiable credentials securely**
- **How IPFS + cryptography ensure decentralized, tamper-proof, and private data storage**
- **How any verifier can independently validate credentials**

## 🔁 System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER CREATES DID                                             │
│    Generate unique DID using did:ethr method                    │
│    Store private key securely in browser local storage          │
│    Display DID and public key on screen                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. ISSUER CREATES VERIFIABLE CREDENTIAL                         │
│    Backend simulates issuer (e.g., University)                  │
│    Signs VC (degree certificate) using issuer's private key     │
│    Sends signed VC to user                                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. HOLDER ENCRYPTS & UPLOADS VC                                 │
│    Frontend receives VC, encrypts locally using AES             │
│    Encryption key derived from user's private key               │
│    Upload encrypted VC to IPFS                                  │
│    Get CID (IPFS hash) for the credential                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. VERIFICATION FLOW                                            │
│    Verifier retrieves CID → downloads from IPFS                 │
│    Decrypts using holder's key (if authorized)                  │
│    Verifies signature with issuer's DID                         │
│    Displays result (✅ valid / ❌ invalid)                       │
└─────────────────────────────────────────────────────────────────┘
```

## 🧩 Tech Stack

### Backend (Node.js + Express)

**Dependencies:**
- `express` - HTTP server framework
- `ethers` - Ethereum library for DID/signing operations
- `crypto-js` - Encryption utilities
- `ipfs-http-client` - IPFS integration (simulated locally)
- `cors` - Cross-origin resource sharing
- `uuid` - Unique ID generation

**Routes:**
- `POST /api/create-did` - Generate DID with key pair
- `GET /api/did-info/:did` - Retrieve DID information
- `POST /api/issue-vc` - Issue signed Verifiable Credential
- `POST /api/vc-info` - Get VC metadata
- `POST /api/verify-vc` - Verify VC signature
- `POST /api/verify-signature` - Verify signature only

### Frontend (React + Tailwind CSS)

**Dependencies:**
- `react` - UI library
- `axios` - HTTP client
- `crypto-js` - Client-side encryption
- `lucide-react` - Icons
- `tailwindcss` - Styling

**Pages:**
- **Identity Tab** - Create DID, display keys
- **Credential Tab** - Request VC, encrypt, upload to IPFS
- **Verify Tab** - Retrieve, decrypt, verify credentials

## 📦 Project Structure

```
hackathon/
├── backend/
│   ├── package.json
│   └── src/
│       ├── server.js                 # Express server setup
│       ├── routes/
│       │   ├── didRoutes.js          # DID creation routes
│       │   ├── vcRoutes.js           # VC issuance routes
│       │   └── verifyRoutes.js       # VC verification routes
│       └── services/
│           ├── didService.js         # DID generation logic
│           └── vcService.js          # VC creation & signing
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx                  # React entry point
│       ├── App.jsx                   # Main app component
│       ├── index.css                 # Tailwind styles
│       ├── components/
│       │   └── UI.jsx                # Reusable UI components
│       ├── pages/
│       │   ├── IdentityTab.jsx       # DID management
│       │   ├── CredentialTab.jsx     # VC issuance
│       │   └── VerifyTab.jsx         # VC verification
│       └── utils/
│           ├── api.js                # Backend API calls
│           ├── storage.js            # LocalStorage utilities
│           ├── encryption.js         # AES encryption
│           └── ipfs.js               # IPFS operations
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ (https://nodejs.org)
- npm or yarn

### Installation & Setup

#### 1. Clone/Navigate to project

```bash
cd c:\Users\sinchana\OneDrive\Desktop\hackathon
```

#### 2. Backend Setup

```bash
cd backend
npm install
npm start
```

Backend will run on `http://localhost:5000`

**Expected output:**
```
╔════════════════════════════════════════════╗
║  🔐 Decentralized Identity Vault Backend    ║
║  Server running on http://localhost:5000    ║
╚════════════════════════════════════════════╝
```

#### 3. Frontend Setup (in a new terminal)

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:3000`

### Testing the Application

#### Test Flow:

1. **Open Frontend**: Navigate to `http://localhost:3000` in your browser

2. **Identity Tab** 🆔
   - Click "Create My DID"
   - Your DID will be generated (format: `did:ethr:0x...`)
   - Public key and private key will be displayed
   - Keys are stored in browser localStorage

3. **Credential Tab** 🎓
   - You should see your DID pre-populated
   - Click "Request VC from Issuer"
   - A signed Verifiable Credential will be issued
   - Click "Encrypt VC Locally" to encrypt with your private key
   - Click "Upload Encrypted VC to IPFS" to store on IPFS
   - You'll receive a CID (Content Identifier)

4. **Verify Tab** ✅
   - Copy the CID from the Credential Tab
   - Paste it into the Verify Tab
   - Click "Retrieve from IPFS" to download the encrypted VC
   - Click "Decrypt VC" to decrypt using your private key
   - Click "Verify Signature" to verify the VC is authentic
   - Results will show the issuer, credential type, and verification status

## 📋 W3C Verifiable Credential Format

Each issued VC follows the W3C Verifiable Credentials Data Model 1.0:

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://www.w3.org/2018/credentials/examples/v1"
  ],
  "type": ["VerifiableCredential", "DegreeCredential"],
  "issuer": "did:ethr:0x1234567890abcdef...",
  "issuanceDate": "2025-11-13T00:00:00Z",
  "credentialSubject": {
    "id": "did:ethr:0x9876543210fedcba...",
    "degree": {
      "type": "BachelorDegree",
      "name": "Bachelor of Technology in Computer Science",
      "university": "Example Tech University",
      "graduationYear": 2025
    }
  },
  "proof": {
    "type": "EcdsaSecp256k1Signature2019",
    "created": "2025-11-13T00:00:00Z",
    "verificationMethod": "did:ethr:0x1234567890abcdef...#keys-1",
    "signatureValue": "0x...",
    "dataHash": "0x..."
  }
}
```

## 🔐 Security Features

### 1. DID Generation
- Uses Ethereum-style key pairs (secp256k1 curve)
- Public key becomes the DID identifier
- Private key stored only in browser localStorage

### 2. Verifiable Credentials
- Signed using ECDSA (Elliptic Curve Digital Signature Algorithm)
- Signature verifiable by anyone with issuer's public key
- W3C compliant structure

### 3. Encryption
- Client-side AES-256 encryption via CryptoJS
- Encryption key derived from user's private key
- Encrypted VC uploaded to IPFS

### 4. IPFS Storage
- Decentralized, content-addressed storage
- CID (Content Identifier) serves as immutable reference
- Encrypted data cannot be accessed without decryption key

### 5. Verification
- Signature verification using recovered address from signature
- Data integrity check against original hash
- Issuer authenticity validation

## 📊 API Documentation

### DID Routes

#### POST `/api/create-did`
Creates a new Decentralized Identifier with key pair.

**Response:**
```json
{
  "success": true,
  "data": {
    "did": "did:ethr:0x1234567890abcdef1234567890abcdef12345678",
    "publicKey": "0x1234567890abcdef1234567890abcdef12345678",
    "privateKey": "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "didDocument": { ... },
    "createdAt": "2025-11-13T10:30:00Z"
  }
}
```

#### GET `/api/did-info/:did`
Retrieve information about a DID.

**Response:**
```json
{
  "success": true,
  "data": {
    "did": "did:ethr:0x...",
    "publicKey": "0x...",
    "didDocument": { ... }
  }
}
```

### VC Routes

#### POST `/api/issue-vc`
Issue a signed Verifiable Credential.

**Request:**
```json
{
  "holderDID": "did:ethr:0xholder...",
  "holderPublicKey": "0xholder...",
  "credentialSubject": {
    "degree": {
      "type": "BachelorDegree",
      "name": "...",
      "university": "...",
      "graduationYear": 2025
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "vc": { ... },
    "vcToken": "eyJ...",
    "issuer": {
      "did": "did:ethr:0xissuer...",
      "publicKey": "0xissuer..."
    }
  }
}
```

### Verify Routes

#### POST `/api/verify-vc`
Verify the authenticity of a Verifiable Credential.

**Request:**
```json
{
  "vc": { ... },
  "issuerPublicKey": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "issuer": "did:ethr:0x...",
    "credentialType": ["VerifiableCredential", "DegreeCredential"],
    "verification": {
      "signatureValid": true,
      "issuerMatches": true,
      "timestamp": "2025-11-13T10:35:00Z"
    }
  }
}
```

## 💡 Key Concepts

### Decentralized Identifier (DID)
A unique identifier that is globally unique, resolvable, and cryptographically verifiable. Format: `did:method:identifier`

In this implementation:
- Method: `ethr` (Ethereum-based)
- Identifier: Ethereum address (public key)
- Example: `did:ethr:0x1234567890abcdef...`

### Verifiable Credential (VC)
A cryptographically signed claim about a subject, issued by a trusted issuer. Follows W3C standard.

Components:
- **Context**: Links to vocabulary definitions
- **Type**: Credential types (e.g., DegreeCredential)
- **Issuer**: Who issued the credential
- **Subject**: Who the credential is about
- **Proof**: Cryptographic signature

### Content Identifier (CID)
A unique content hash generated by IPFS. Used to retrieve data from IPFS.

Format: `Qm...` (base58-encoded multihash)

Example: `QmXx1234567890abcdef...`

### Encryption Key Derivation
```
EncryptionKey = SHA256(privateKey)
```

This ensures:
- Only holder can decrypt their own VCs
- Encryption key is deterministic
- No additional secret storage needed

## 🧪 Example Scenario

### User Journey:

1. **Alice installs app**
   - Clicks "Create My DID"
   - Gets DID: `did:ethr:0xAlice123...`
   - Private key stored securely in localStorage

2. **Alice requests degree credential from University**
   - Clicks "Request VC from Issuer"
   - Backend (issuer) creates signed credential
   - Alice receives: `{ issuer: "did:ethr:0xUniversity...", subject: "did:ethr:0xAlice123...", ... }`

3. **Alice secures her credential**
   - Clicks "Encrypt VC Locally"
   - VC encrypted with AES using key derived from her private key
   - Clicks "Upload to IPFS"
   - Gets CID: `QmAliceCredential123...`

4. **Alice shares credential reference**
   - Shares CID with employer Bob
   - Bob goes to Verify tab
   - Pastes CID
   - System retrieves encrypted VC from IPFS
   - Bob is prompted for decryption (needs Alice's permission or key)
   - System verifies signature with University's public key
   - Result: ✅ "Valid degree credential from University"

## 🔍 Debugging & Monitoring

### Browser Console
All operations log detailed messages:
```
📝 Processing /create-did request...
✅ DID Generated Successfully
   DID: did:ethr:0x...
   Public Key (Address): 0x...
```

### Backend Logs
Terminal output shows all requests:
```
📨 [2025-11-13T10:30:00Z] POST /api/create-did
✅ DID created and stored successfully
```

### Browser DevTools
- **Application Tab** → LocalStorage: View stored DID and credentials
- **Network Tab**: Monitor API requests to backend
- **Console**: View encryption/decryption logs

## 📝 Customization

### Change Issuer Information

Edit `backend/src/services/vcService.js`:
```javascript
const ISSUER_PRIVATE_KEY = '0x...'; // Your private key
```

### Customize Credential Subject

In Frontend → Credential Tab → Edit JSON in textarea before requesting VC:
```json
{
  "degree": {
    "type": "DoctorOfPhilosophy",
    "name": "PhD in Computer Science",
    "university": "MIT",
    "graduationYear": 2026
  }
}
```

### Use Real IPFS

Replace `frontend/src/utils/ipfs.js` with actual ipfs-http-client:
```javascript
import { create } from 'ipfs-http-client';

const ipfs = create({ url: 'http://localhost:5001' });

export const uploadToIPFS = async (data) => {
  const result = await ipfs.add(Buffer.from(data));
  return result.cid.toString();
};
```

## ⚠️ Important Notes

### Production Deployment

This is a **hackathon prototype** for educational purposes. For production:

1. **Use blockchain-based DID registry** (e.g., Ethereum smart contracts)
2. **Store private keys in secure vaults** (not browser localStorage)
3. **Use real IPFS nodes** with pinning service
4. **Implement proper authentication** for credential verification
5. **Add rate limiting** and security headers
6. **Use HTTPS** for all communications
7. **Audit cryptographic implementations**

### Data Persistence

- DIDs and credentials are stored in browser localStorage
- This is lost when browser data is cleared
- For persistence, integrate with a backend database

### Browser Compatibility

- Requires modern browser with:
  - ES6+ JavaScript support
  - Local Storage API
  - Crypto Web APIs

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🛠️ Troubleshooting

### "Backend not running" error
- Ensure backend is running on port 5000
- Check if `npm start` was executed in backend directory
- Verify no other service is using port 5000

### "Failed to create DID"
- Check browser console for errors
- Verify backend is accessible
- Check network tab in DevTools

### "Failed to encrypt/decrypt"
- Ensure you're using the same DID for encryption/decryption
- Verify private key is correctly stored in localStorage
- Check if credential data is corrupted

### IPFS operations slow
- This is normal for simulated IPFS (500ms delay simulated)
- In production, use real IPFS with faster response times

## 📚 Resources

### W3C Standards
- [Verifiable Credentials Data Model 1.0](https://www.w3.org/TR/vc-data-model/)
- [DID Specification](https://w3c-ccg.github.io/did-core/)

### Libraries
- [Ethers.js Documentation](https://docs.ethers.org/)
- [CryptoJS](https://cryptojs.gitbook.io/)
- [IPFS](https://ipfs.io/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

### DIDs
- [did:ethr Method Spec](https://github.com/uport-project/ethr-did-resolver/blob/main/doc/index.md)
- [DID Use Cases](https://www.w3.org/TR/did-use-cases/)

## 📄 License

MIT License - Feel free to use this code for educational and commercial purposes.

## 👥 Contributing

This is a hackathon project. For improvements or bug reports, please create issues or pull requests.

## ❓ FAQ

**Q: Can I use this in production?**
A: Not as-is. This is an educational prototype. See "Production Deployment" section above.

**Q: Is my data really encrypted?**
A: Yes! Client-side AES encryption is applied. Only you can decrypt it with your private key.

**Q: Can I share credentials with others?**
A: You can share the CID, but they need your encryption key (or permission) to decrypt.

**Q: What if I lose my private key?**
A: You cannot recover it. Store it securely. Lost = data lost.

**Q: Can verifiers see my encrypted credentials?**
A: Without your encryption key, no. They only see encrypted data on IPFS.

**Q: Is this blockchain?**
A: No blockchain deployment needed. DIDs are simulated using Ethereum-style keys.

---

**Built with ❤️ for Hackathon • Demonstrating Decentralized Identity**

🔐 Self-Sovereign Identity • 🎓 Verifiable Credentials • 📦 IPFS Storage
