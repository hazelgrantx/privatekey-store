# PrivateKeyVault

A decentralized, privacy-preserving solution for securely storing and managing encrypted private keys on-chain using Fully Homomorphic Encryption (FHE) technology powered by Zama's FHEVM.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Problem Statement](#problem-statement)
- [Solution Architecture](#solution-architecture)
- [Technology Stack](#technology-stack)
- [How It Works](#how-it-works)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Deployment](#deployment)
  - [Running the Application](#running-the-application)
- [Usage](#usage)
  - [Smart Contract Interactions](#smart-contract-interactions)
  - [Frontend Application](#frontend-application)
  - [Hardhat Tasks](#hardhat-tasks)
- [Security Model](#security-model)
- [Testing](#testing)
- [Deployment Addresses](#deployment-addresses)
- [Future Roadmap](#future-roadmap)
- [Contributing](#contributing)
- [License](#license)

## Overview

PrivateKeyVault is a groundbreaking decentralized application that leverages Fully Homomorphic Encryption (FHE) to enable secure on-chain storage of encrypted private keys. Unlike traditional key management solutions, this system ensures that sensitive cryptographic material remains encrypted even while stored on the public blockchain, with decryption only possible by the rightful owner.

The project demonstrates advanced cryptographic techniques by combining:
- **AES-GCM encryption** for private key confidentiality
- **Zama FHEVM** for encrypted address storage on-chain
- **Ethereum smart contracts** for decentralized storage
- **Web3 wallet integration** for seamless user experience

## Key Features

### Privacy-First Design
- **Fully Encrypted Storage**: Private keys are encrypted client-side using AES-256-GCM before ever leaving the user's browser
- **FHE-Protected Helper Addresses**: Helper addresses used for encryption are stored on-chain using Fully Homomorphic Encryption, ensuring they remain confidential
- **Zero-Knowledge Architecture**: The smart contract never sees unencrypted sensitive data

### Advanced Cryptography
- **Dual-Layer Encryption**: Combines symmetric encryption (AES-GCM) with homomorphic encryption (FHEVM)
- **Deterministic Key Derivation**: Uses SHA-256 hashing to derive AES keys from helper addresses
- **Cryptographic Proofs**: Leverages Zama's input proofs to verify encrypted data integrity

### User-Friendly Interface
- **Intuitive Web Application**: Built with React 19 and modern UI patterns
- **RainbowKit Integration**: Seamless wallet connection with support for multiple providers
- **Real-Time Status Updates**: Clear feedback for all operations (encryption, storage, decryption)
- **Step-by-Step Workflow**: Guided process from key generation to retrieval

### Decentralization & Transparency
- **Open Source**: Fully auditable smart contract code
- **On-Chain Storage**: All encrypted data stored on Ethereum blockchain
- **Self-Custody**: Users maintain complete control over their private keys
- **Permissionless**: No centralized authority or trusted third party required

### Developer Experience
- **Comprehensive Hardhat Tasks**: Command-line tools for all contract interactions
- **TypeScript Support**: Fully typed codebase for both frontend and backend
- **Extensive Testing**: Test suite covering all critical functionality
- **Mock FHEVM Support**: Local development and testing without mainnet dependencies

## Problem Statement

The blockchain ecosystem faces several critical challenges in private key management:

### 1. Key Loss and Recovery
Traditional self-custody solutions lack secure backup mechanisms. Users who lose their private keys permanently lose access to their assets. Current solutions include:
- **Hardware Wallets**: Expensive and can be lost or damaged
- **Paper Backups**: Vulnerable to physical destruction and theft
- **Social Recovery**: Requires trust in multiple parties
- **Custodial Services**: Sacrifice self-custody principles

### 2. Multi-Device Access
Users often need to access their wallets from multiple devices, but securely synchronizing private keys across devices is challenging:
- Cloud storage is vulnerable to breaches
- Manual transfer is error-prone and insecure
- Traditional encryption doesn't protect against blockchain analysis

### 3. Privacy Concerns
Storing encrypted keys on-chain with conventional encryption exposes metadata:
- Transaction patterns can be analyzed
- Encrypted data can be decrypted if encryption keys are compromised
- Helper addresses or encryption parameters may leak sensitive information

### 4. Trust Dependencies
Most existing solutions require trusting:
- Centralized key management services
- Cloud storage providers
- Hardware wallet manufacturers
- Smart contract administrators with special privileges

## Solution Architecture

PrivateKeyVault addresses these challenges through a novel two-layer encryption approach:

### Layer 1: Client-Side AES Encryption
1. Generate a random helper wallet address (Helper Address B)
2. Derive an AES-256 key from Helper Address B using SHA-256
3. Encrypt the private key (Private Key A) with AES-256-GCM
4. Generate random IV for each encryption operation
5. Produce Encrypted Payload C = IV || AES-GCM(Private Key A)

### Layer 2: FHE On-Chain Storage
1. Use Zama FHEVM to encrypt Helper Address B homomorphically
2. Store the encrypted helper address handle on-chain
3. Store Encrypted Payload C (ciphertext) on-chain
4. Both pieces are linked to the user's Ethereum address

### Retrieval Process
1. Fetch encrypted data from the smart contract
2. Use Zama's user decryption protocol to recover Helper Address B
3. Derive the AES key from the decrypted Helper Address B
4. Decrypt Encrypted Payload C to recover Private Key A

### Security Properties
- **Confidentiality**: Private keys never exist unencrypted on-chain
- **Integrity**: Cryptographic proofs ensure data hasn't been tampered with
- **Availability**: Data is stored on the immutable blockchain
- **Privacy**: FHE prevents blockchain analysis of helper addresses
- **Self-Sovereignty**: Only the owner can decrypt their private key

## Technology Stack

### Smart Contract Layer
- **Solidity ^0.8.27**: Smart contract programming language
- **Zama FHEVM (@fhevm/solidity ^0.8.0)**: Fully Homomorphic Encryption for Ethereum
- **Hardhat ^2.26.0**: Ethereum development environment
- **OpenZeppelin**: Security-audited contract utilities
- **TypeChain**: TypeScript bindings for smart contracts

### Frontend Layer
- **React 19.1.1**: Modern UI library with concurrent features
- **TypeScript 5.8.3**: Type-safe development
- **Vite 7.1.6**: Next-generation build tool with HMR
- **Wagmi ^2.17.0**: React Hooks for Ethereum
- **Viem ^2.37.6**: TypeScript Ethereum interface
- **RainbowKit ^2.2.8**: Best-in-class wallet connection UI
- **TanStack Query ^5.89.0**: Powerful async state management
- **Zama Relayer SDK ^0.2.0**: FHE encryption client library
- **Ethers.js ^6.15.0**: Ethereum library for cryptographic operations

### Development Tools
- **Hardhat Deploy**: Deployment management system
- **Hardhat Gas Reporter**: Gas usage optimization
- **Hardhat Verify**: Contract verification on block explorers
- **Mocha & Chai**: Testing framework and assertions
- **Solhint**: Solidity linting tool
- **ESLint & Prettier**: Code formatting and linting
- **Solidity Coverage**: Test coverage reporting

### Cryptography
- **AES-256-GCM**: Authenticated encryption for private keys
- **SHA-256**: Cryptographic hashing for key derivation
- **FHEVM**: Fully Homomorphic Encryption for on-chain privacy
- **EIP-712**: Typed structured data hashing and signing

### Networks Supported
- **Hardhat Local**: Development and testing
- **Anvil**: Foundry's local testing node
- **Sepolia Testnet**: Ethereum testnet deployment
- **Extensible**: Easy to add mainnet or other EVM chains

## How It Works

### Detailed Workflow

#### Phase 1: Key Generation and Encryption

1. **Private Key Generation**
   ```typescript
   const wallet = ethers.Wallet.createRandom();
   const privateKeyA = wallet.privateKey; // 0x...
   ```

2. **Helper Address Creation**
   ```typescript
   const helperWallet = ethers.Wallet.createRandom();
   const helperAddressB = helperWallet.address; // 0x...
   ```

3. **AES Key Derivation**
   ```typescript
   const normalized = helperAddressB.toLowerCase();
   const digest = await crypto.subtle.digest('SHA-256', encoder.encode(normalized));
   const aesKey = await crypto.subtle.importKey('raw', digest,
     { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
   ```

4. **Private Key Encryption**
   ```typescript
   const iv = crypto.getRandomValues(new Uint8Array(12));
   const ciphertext = await crypto.subtle.encrypt(
     { name: 'AES-GCM', iv },
     aesKey,
     ethers.getBytes(privateKeyA)
   );
   const encryptedPayloadC = ethers.hexlify([...iv, ...ciphertext]);
   ```

#### Phase 2: On-Chain Storage

1. **FHE Input Creation**
   ```typescript
   const encryptedInput = await zamaInstance
     .createEncryptedInput(contractAddress, userAddress)
     .addAddress(helperAddressB)
     .encrypt();
   ```

2. **Smart Contract Transaction**
   ```solidity
   function storeKeyRecord(
     externalEaddress encryptedAddress,    // FHE-encrypted Helper Address B
     bytes calldata encryptedPrivateKey,    // Encrypted Payload C
     bytes calldata inputProof              // Validity proof
   ) external {
     eaddress storedAddress = FHE.fromExternal(encryptedAddress, inputProof);
     _records[msg.sender] = KeyRecord({
       encryptedHelperAddress: storedAddress,
       encryptedPrivateKey: encryptedPrivateKey
     });
     FHE.allow(storedAddress, msg.sender);
     emit KeyRecordStored(msg.sender);
   }
   ```

#### Phase 3: Retrieval and Decryption

1. **Fetch Encrypted Data**
   ```typescript
   const encryptedPayloadC = await contract.getEncryptedPrivateKey(userAddress);
   const helperHandle = await contract.getEncryptedHelperAddress(userAddress);
   ```

2. **FHE Decryption (Helper Address)**
   ```typescript
   const keypair = zamaInstance.generateKeypair();
   const eip712 = zamaInstance.createEIP712(...);
   const signature = await signer.signTypedData(...);
   const decryptedResults = await zamaInstance.userDecrypt(
     [{ handle: helperHandle, contractAddress }],
     keypair.privateKey,
     keypair.publicKey,
     signature,
     ...
   );
   const helperAddressB = decryptedResults[helperHandle];
   ```

3. **AES Decryption (Private Key)**
   ```typescript
   const aesKey = await deriveAesKey(helperAddressB);
   const bytes = ethers.getBytes(encryptedPayloadC);
   const iv = bytes.slice(0, 12);
   const cipherBytes = bytes.slice(12);
   const plaintext = await crypto.subtle.decrypt(
     { name: 'AES-GCM', iv },
     aesKey,
     cipherBytes
   );
   const privateKeyA = ethers.hexlify(plaintext);
   ```

### Data Flow Diagram

```
┌─────────────────┐
│   User Browser  │
└────────┬────────┘
         │
         │ 1. Generate Private Key A
         │ 2. Generate Helper Address B
         │ 3. Encrypt A with B → Payload C
         │
         ▼
┌─────────────────────────────┐
│   Zama FHEVM Client SDK     │
│  (Homomorphic Encryption)   │
└────────┬────────────────────┘
         │
         │ 4. Encrypt Helper Address B → Handle
         │
         ▼
┌──────────────────────────────────┐
│   PrivateKeyVault Smart Contract │
│   ┌──────────────────────────┐   │
│   │ Encrypted Helper Handle  │   │
│   │ Encrypted Payload C      │   │
│   │ User Address Mapping     │   │
│   └──────────────────────────┘   │
└──────────────────────────────────┘
         │
         │ 5. Retrieve encrypted data
         │ 6. FHE Decrypt → Helper Address B
         │ 7. AES Decrypt → Private Key A
         │
         ▼
┌─────────────────┐
│   User Browser  │
│ Private Key A ✓ │
└─────────────────┘
```

## Project Structure

```
privatekey-store/
├── contracts/
│   └── PrivateKeyVault.sol          # Main smart contract
├── deploy/
│   └── deploy.ts                     # Deployment script
├── tasks/
│   ├── accounts.ts                   # Account management tasks
│   └── privateKeyVault.ts            # Vault interaction tasks
├── test/
│   └── PrivateKeyVault.ts            # Contract test suite
├── ui/                               # Frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx            # App header component
│   │   │   └── VaultApp.tsx          # Main application logic
│   │   ├── config/
│   │   │   ├── contracts.ts          # Contract ABI and address
│   │   │   └── wagmi.ts              # Web3 configuration
│   │   ├── hooks/
│   │   │   ├── useEthersSigner.ts    # Ethers.js signer hook
│   │   │   └── useZamaInstance.ts    # FHEVM instance hook
│   │   ├── utils/
│   │   │   └── encryption.ts         # AES encryption utilities
│   │   ├── styles/
│   │   │   └── VaultApp.css          # Application styles
│   │   ├── App.tsx                   # Root component
│   │   └── main.tsx                  # Application entry point
│   ├── package.json
│   └── vite.config.ts
├── hardhat.config.ts                 # Hardhat configuration
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites

- **Node.js**: >= 20.0.0
- **npm**: >= 7.0.0
- **Git**: Latest version
- **MetaMask** or other Web3 wallet (for frontend usage)
- **Infura API Key** (for testnet deployment)
- **Etherscan API Key** (for contract verification)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/privatekey-store.git
   cd privatekey-store
   ```

2. **Install smart contract dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ui
   npm install
   cd ..
   ```

### Configuration

1. **Set up Hardhat environment variables**
   ```bash
   npx hardhat vars set MNEMONIC
   npx hardhat vars set INFURA_API_KEY
   npx hardhat vars set ETHERSCAN_API_KEY
   ```

   Or create a `.env` file:
   ```bash
   MNEMONIC="your twelve word mnemonic phrase here"
   PRIVATE_KEY="your-private-key-for-deployment"
   INFURA_API_KEY="your-infura-api-key"
   ETHERSCAN_API_KEY="your-etherscan-api-key"
   ```

2. **Configure frontend environment**
   ```bash
   cd ui
   cp .env.example .env

   # Edit ui/.env
   VITE_VAULT_CONTRACT_ADDRESS="0x..."
   VITE_CHAIN_ID="11155111"  # Sepolia
   ```

### Deployment

#### Local Development

1. **Start a local Hardhat node**
   ```bash
   npm run chain
   ```

2. **Deploy contracts (in a new terminal)**
   ```bash
   npm run deploy:localhost
   ```

3. **Note the deployed contract address** and update `ui/.env`

#### Sepolia Testnet

1. **Ensure you have Sepolia ETH** in your deployment wallet

2. **Deploy to Sepolia**
   ```bash
   npm run deploy:sepolia
   ```

3. **Verify the contract**
   ```bash
   npm run verify:sepolia
   ```

4. **Update frontend configuration** with the deployed address

### Running the Application

#### Smart Contract Testing

```bash
# Run all tests
npm test

# Run tests on Sepolia testnet
npm run test:sepolia

# Run with gas reporting
REPORT_GAS=true npm test

# Run with coverage
npm run coverage
```

#### Frontend Development

```bash
cd ui
npm run dev
```

The application will be available at `http://localhost:5173`

#### Production Build

```bash
cd ui
npm run build
npm run preview
```

## Usage

### Smart Contract Interactions

#### Using Hardhat Tasks

1. **Store an encrypted key record**
   ```bash
   npx hardhat task:vault-store \
     --helper "0x1234...5678" \
     --cipher "0xabcd...ef01" \
     --network sepolia
   ```

2. **Retrieve encrypted private key**
   ```bash
   npx hardhat task:vault-get-private-key \
     --owner "0x9876...5432" \
     --network sepolia
   ```

3. **Decrypt helper address**
   ```bash
   npx hardhat task:vault-decrypt-helper \
     --network sepolia
   ```

4. **Get contract address**
   ```bash
   npx hardhat task:vault-address --network sepolia
   ```

#### Programmatic Usage

```typescript
import { ethers } from "hardhat";

const contract = await ethers.getContractAt(
  "PrivateKeyVault",
  contractAddress
);

// Store encrypted data
await contract.storeKeyRecord(
  encryptedAddressHandle,
  encryptedPayload,
  inputProof
);

// Check if record exists
const hasRecord = await contract.hasKeyRecord(userAddress);

// Retrieve encrypted data
const encryptedKey = await contract.getEncryptedPrivateKey(userAddress);
const helperHandle = await contract.getEncryptedHelperAddress(userAddress);

// Clear stored record
await contract.clearKeyRecord();
```

### Frontend Application

#### Step-by-Step User Guide

1. **Connect Wallet**
   - Click "Connect Wallet" in the header
   - Select your preferred wallet provider (MetaMask, WalletConnect, etc.)
   - Approve the connection request

2. **Generate & Encrypt**
   - Click "Generate Private Key A" to create a new random private key
   - Click "Encrypt with Helper Address B" to encrypt it
   - The system automatically generates a helper address and encrypts your private key

3. **Store On-Chain**
   - Ensure your wallet is connected and has sufficient gas
   - Click "Save Encrypted Data" to store on the blockchain
   - Approve the transaction in your wallet
   - Wait for transaction confirmation

4. **Retrieve & Decrypt**
   - Click "Load Encrypted Record" to fetch your stored data
   - Click "Decrypt Private Key" to recover your original private key
   - Sign the decryption request in your wallet
   - Your private key will be displayed after successful decryption

#### Frontend Architecture

The application uses modern React patterns:

- **State Management**: React hooks (useState, useCallback, useMemo)
- **Web3 Integration**: Wagmi hooks for blockchain interactions
- **Async Operations**: TanStack Query for data fetching and caching
- **Type Safety**: Full TypeScript coverage
- **Error Handling**: Comprehensive try-catch blocks with user feedback

### Hardhat Tasks

The project includes custom Hardhat tasks for easy contract interaction:

- `task:vault-address`: Print the deployed contract address
- `task:vault-store`: Store encrypted data on-chain
- `task:vault-get-private-key`: Retrieve encrypted private key
- `task:vault-decrypt-helper`: Decrypt the helper address using FHEVM

## Security Model

### Threat Model

**Assumptions:**
- The user's browser environment is secure
- The user's wallet private key is secure
- The Ethereum blockchain is secure and immutable
- Zama's FHEVM implementation is cryptographically sound

**What we protect against:**
- ✅ Blockchain observers learning the helper address
- ✅ Blockchain observers learning the private key
- ✅ Contract administrators accessing user data
- ✅ Man-in-the-middle attacks (cryptographic proofs)
- ✅ Replay attacks (nonces and signatures)
- ✅ Unauthorized access (wallet signature required)

**What we don't protect against:**
- ❌ Compromised user browsers or malware
- ❌ Stolen wallet private keys
- ❌ Social engineering attacks
- ❌ Physical access to user's device during operation
- ❌ Quantum computing attacks on elliptic curves (future threat)

### Best Practices

1. **Operational Security**
   - Never use this for production cryptocurrency wallets without extensive auditing
   - Always use the application on a trusted device
   - Verify contract addresses before interacting
   - Keep your wallet private key secure

2. **Development Security**
   - All dependencies are pinned to specific versions
   - Security overrides in package.json address known vulnerabilities
   - Contract uses OpenZeppelin best practices
   - Comprehensive test coverage

3. **Cryptographic Security**
   - AES-256-GCM provides authenticated encryption
   - Random IVs prevent deterministic encryption
   - SHA-256 is collision-resistant for key derivation
   - FHEVM provides computational privacy guarantees

### Audit Status

⚠️ **WARNING**: This project is a proof-of-concept and has not undergone professional security audits. Do not use with real funds or sensitive cryptographic material without:
- Independent security audit
- Formal verification of smart contract logic
- Penetration testing of the frontend application
- Review by cryptography experts

## Testing

### Smart Contract Tests

The test suite covers:
- ✅ Storing and retrieving encrypted key material
- ✅ Clearing existing records
- ✅ Access control (only owner can clear)
- ✅ Error handling (empty keys, non-existent records)
- ✅ Event emissions
- ✅ FHE encryption/decryption round-trip

Run tests:
```bash
# Local mock FHEVM tests
npm test

# Sepolia testnet tests (requires ETH)
npm run test:sepolia

# With gas reporting
REPORT_GAS=true npm test

# With coverage
npm run coverage
```

### Frontend Testing

Frontend testing can be performed manually using the UI or by:
```bash
cd ui
npm run lint
npm run build  # Type-checking
```

## Deployment Addresses

### Sepolia Testnet

- **PrivateKeyVault**: `[Add deployed address after deployment]`
- **Block Explorer**: `https://sepolia.etherscan.io/address/[contract-address]`

### Mainnet

⚠️ **Not deployed to mainnet.** This is a proof-of-concept and should not be used in production without thorough auditing.

## Future Roadmap

### Short-Term (Q2 2025)

- [ ] **Professional Security Audit**: Engage third-party auditors
- [ ] **Enhanced Error Handling**: More descriptive error messages
- [ ] **Mobile Responsive Design**: Optimize UI for mobile devices
- [ ] **Multi-Key Support**: Store multiple private keys per user
- [ ] **Key Metadata**: Add labels/tags to stored keys
- [ ] **Export/Import Features**: Backup encrypted data offline

### Medium-Term (Q3-Q4 2025)

- [ ] **Social Recovery**: Implement Shamir Secret Sharing for recovery
- [ ] **Multi-Chain Support**: Deploy on Polygon, Arbitrum, Optimism
- [ ] **Gas Optimization**: Reduce transaction costs
- [ ] **Hardware Wallet Integration**: Direct signing with Ledger/Trezor
- [ ] **Access Control Policies**: Time-locks, spending limits
- [ ] **Batch Operations**: Store/retrieve multiple keys in one transaction

### Long-Term (2026+)

- [ ] **Zero-Knowledge Proofs**: ZK-SNARK-based authentication
- [ ] **Decentralized Frontend**: IPFS hosting
- [ ] **DAO Governance**: Community-driven upgrades
- [ ] **Key Sharing**: Secure key sharing with granular permissions
- [ ] **Quantum-Resistant Cryptography**: Prepare for post-quantum era
- [ ] **Cross-Chain Bridges**: Move encrypted keys between chains
- [ ] **Integration APIs**: Allow dApps to integrate vault functionality
- [ ] **Audit Dashboard**: User activity monitoring and alerts

### Research & Innovation

- [ ] **Threshold Cryptography**: Distributed key generation
- [ ] **Homomorphic Operations**: Compute on encrypted keys
- [ ] **TEE Integration**: Hardware security module support
- [ ] **Formal Verification**: Mathematical proof of security properties
- [ ] **Privacy-Preserving Analytics**: Usage metrics without compromising privacy

## Contributing

We welcome contributions from the community! Whether it's bug reports, feature requests, documentation improvements, or code contributions, please feel free to get involved.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style (enforced by ESLint and Prettier)
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR
- Write clear commit messages

### Areas for Contribution

- 🐛 **Bug Fixes**: Help identify and fix issues
- 📚 **Documentation**: Improve guides, tutorials, and API docs
- 🎨 **UI/UX**: Enhance the user interface and experience
- 🔒 **Security**: Identify vulnerabilities and propose fixes
- ⚡ **Performance**: Optimize gas usage and frontend performance
- 🧪 **Testing**: Expand test coverage
- 🌐 **Internationalization**: Add multi-language support

## License

This project is licensed under the **BSD-3-Clause-Clear License**.

```
Copyright (c) 2025 PrivateKeyVault Contributors

Redistribution and use in source and binary forms, with or without
modification, are permitted (subject to the limitations in the disclaimer
below) provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice,
   this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

NO EXPRESS OR IMPLIED LICENSES TO ANY PARTY'S PATENT RIGHTS ARE GRANTED
BY THIS LICENSE. THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND
CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING,
BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```

## Acknowledgments

- **Zama**: For the groundbreaking FHEVM technology
- **OpenZeppelin**: For secure smart contract libraries
- **Hardhat**: For the excellent development framework
- **RainbowKit**: For the beautiful wallet connection UI
- **The Ethereum Community**: For continuous innovation

---

## Disclaimer

⚠️ **IMPORTANT**: This is experimental software provided for educational and research purposes. It has not been audited and should not be used with real funds or sensitive cryptographic material. The authors assume no liability for any losses incurred through the use of this software.

**Use at your own risk.**

---

## Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/privatekey-store/issues)
- **Discussions**: [Join the community](https://github.com/yourusername/privatekey-store/discussions)
- **Zama Community**: [Zama Discord](https://discord.gg/zama)
- **FHEVM Documentation**: [docs.zama.ai](https://docs.zama.ai)

---

**Built with ❤️ using Zama FHEVM, Hardhat, React, and TypeScript**

**Securing the future of decentralized key management**
