import { useCallback, useMemo, useState } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { ethers } from 'ethers';
import { Header } from './Header';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { vaultContract } from '../config/contracts';
import { decryptPrivateKeyWithAddress, encryptPrivateKeyWithAddress } from '../utils/encryption';
import '../styles/VaultApp.css';

type AsyncState = 'idle' | 'loading';

const { address: contractAddress, abi } = vaultContract;

export function VaultApp() {
  const { address: account } = useAccount();
  const signer = useEthersSigner();
  const publicClient = usePublicClient();
  const { instance: zamaInstance, isLoading: zamaLoading, error: zamaError } = useZamaInstance();

  const [generatedPrivateKey, setGeneratedPrivateKey] = useState<string | null>(null);
  const [helperAddress, setHelperAddress] = useState<string | null>(null);
  const [encryptedPrivateKey, setEncryptedPrivateKey] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const [storedCiphertext, setStoredCiphertext] = useState<string | null>(null);
  const [storedHelperHandle, setStoredHelperHandle] = useState<string | null>(null);
  const [decryptedPrivateKey, setDecryptedPrivateKey] = useState<string | null>(null);

  const [encryptionState, setEncryptionState] = useState<AsyncState>('idle');
  const [storageState, setStorageState] = useState<AsyncState>('idle');
  const [fetchState, setFetchState] = useState<AsyncState>('idle');
  const [decryptState, setDecryptState] = useState<AsyncState>('idle');

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<'info' | 'error' | 'success'>('info');

  const isSignerReady = useMemo(() => Boolean(account && signer), [account, signer]);

  const resetStatus = useCallback(() => {
    setStatusMessage(null);
    setStatusTone('info');
  }, []);

  const pushStatus = useCallback((message: string, tone: 'info' | 'error' | 'success' = 'info') => {
    setStatusMessage(message);
    setStatusTone(tone);
  }, []);

  const handleGeneratePrivateKey = useCallback(() => {
    resetStatus();
    const wallet = ethers.Wallet.createRandom();
    setGeneratedPrivateKey(wallet.privateKey);
    setHelperAddress(null);
    setEncryptedPrivateKey(null);
    setTransactionHash(null);
    setStoredCiphertext(null);
    setStoredHelperHandle(null);
    setDecryptedPrivateKey(null);
    pushStatus('Generated a fresh private key A.', 'success');
  }, [resetStatus, pushStatus]);

  const handleEncrypt = useCallback(async () => {
    if (!generatedPrivateKey) {
      pushStatus('Generate a private key before encrypting.', 'error');
      return;
    }

    setEncryptionState('loading');
    resetStatus();

    try {
      const helperWallet = ethers.Wallet.createRandom();
      const ciphertext = await encryptPrivateKeyWithAddress(generatedPrivateKey, helperWallet.address);

      setHelperAddress(helperWallet.address);
      setEncryptedPrivateKey(ciphertext);
      setDecryptedPrivateKey(null);
      pushStatus('Encrypted private key A using helper address B.', 'success');
    } catch (error) {
      console.error('Encryption failed', error);
      pushStatus('Failed to encrypt the private key.', 'error');
    } finally {
      setEncryptionState('idle');
    }
  }, [generatedPrivateKey, resetStatus, pushStatus]);

  const handleStoreOnChain = useCallback(async () => {
    if (!contractAddress) {
      pushStatus('Contract address is not configured.', 'error');
      return;
    }
    if (!isSignerReady || !account || !signer) {
      pushStatus('Connect a wallet before saving on-chain.', 'error');
      return;
    }
    if (!zamaInstance) {
      pushStatus('Encryption service is still initializing.', 'error');
      return;
    }
    if (!helperAddress || !encryptedPrivateKey) {
      pushStatus('Generate and encrypt a private key first.', 'error');
      return;
    }

    setStorageState('loading');
    resetStatus();

    try {
      const encryptedInput = await zamaInstance
        .createEncryptedInput(contractAddress, account)
        .addAddress(helperAddress)
        .encrypt();

      const signerInstance = await signer;
      if (!signerInstance) {
        throw new Error('Signer is unavailable');
      }

      const contract = new ethers.Contract(contractAddress, abi, signerInstance);
      const tx = await contract.storeKeyRecord(
        encryptedInput.handles[0],
        encryptedPrivateKey,
        encryptedInput.inputProof,
      );

      setTransactionHash(tx.hash);
      await tx.wait();

      pushStatus('Encrypted payload stored on-chain.', 'success');
    } catch (error) {
      console.error('storeKeyRecord failed', error);
      pushStatus('Failed to store encrypted data on-chain.', 'error');
    } finally {
      setStorageState('idle');
    }
  }, [account, abi, contractAddress, encryptedPrivateKey, helperAddress, isSignerReady, pushStatus, resetStatus, signer, zamaInstance]);

  const handleFetchRecord = useCallback(async () => {
    if (!contractAddress) {
      pushStatus('Contract address is not configured.', 'error');
      return;
    }
    if (!publicClient) {
      pushStatus('Public client is unavailable.', 'error');
      return;
    }
    if (!account) {
      pushStatus('Connect a wallet to check stored records.', 'error');
      return;
    }

    setFetchState('loading');
    resetStatus();

    try {
      const targetAddress = contractAddress as `0x${string}`;

      const hasRecord = await publicClient.readContract({
        address: targetAddress,
        abi,
        functionName: 'hasKeyRecord',
        args: [account],
      });

      if (!hasRecord) {
        setStoredCiphertext(null);
        setStoredHelperHandle(null);
        pushStatus('No encrypted record found for this address.', 'info');
        return;
      }

      const [ciphertext, helperHandle] = await Promise.all([
        publicClient.readContract({
          address: targetAddress,
          abi,
          functionName: 'getEncryptedPrivateKey',
          args: [account],
        }),
        publicClient.readContract({
          address: targetAddress,
          abi,
          functionName: 'getEncryptedHelperAddress',
          args: [account],
        }),
      ]);

      setStoredCiphertext(ciphertext as string);
      setStoredHelperHandle(helperHandle as string);
      pushStatus('Fetched encrypted record from the contract.', 'success');
    } catch (error) {
      console.error('Fetching encrypted record failed', error);
      pushStatus('Unable to fetch encrypted record.', 'error');
    } finally {
      setFetchState('idle');
    }
  }, [account, abi, contractAddress, publicClient, pushStatus, resetStatus]);

  const handleDecrypt = useCallback(async () => {
    if (!contractAddress) {
      pushStatus('Contract address is not configured.', 'error');
      return;
    }
    if (!storedCiphertext || !storedHelperHandle) {
      pushStatus('Load the encrypted data before decrypting.', 'error');
      return;
    }
    if (!zamaInstance) {
      pushStatus('Encryption service is still initializing.', 'error');
      return;
    }
    if (!account || !signer) {
      pushStatus('Connect a wallet to sign the decryption request.', 'error');
      return;
    }

    setDecryptState('loading');
    resetStatus();

    try {
      const keypair = zamaInstance.generateKeypair();
      const startTimestamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = '7';
      const contractAddresses = [contractAddress];
      const handles = [
        {
          handle: storedHelperHandle,
          contractAddress,
        },
      ];

      const eip712 = zamaInstance.createEIP712(
        keypair.publicKey,
        contractAddresses,
        startTimestamp,
        durationDays,
      );

      const signerInstance = await signer;
      if (!signerInstance) {
        throw new Error('Signer is unavailable');
      }

      const signature = await signerInstance.signTypedData(
        eip712.domain,
        { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
        eip712.message,
      );

      const decryptedResults = await zamaInstance.userDecrypt(
        handles,
        keypair.privateKey,
        keypair.publicKey,
        signature,
        contractAddresses,
        account,
        startTimestamp,
        durationDays,
      );

      const decryptedHelperAddress = decryptedResults[storedHelperHandle.toLowerCase()];

      if (!decryptedHelperAddress) {
        throw new Error('Decryption output missing helper address');
      }

      const clearPrivateKey = await decryptPrivateKeyWithAddress(
        decryptedHelperAddress,
        storedCiphertext,
      );

      setDecryptedPrivateKey(clearPrivateKey);
      pushStatus('Successfully decrypted the private key.', 'success');
    } catch (error) {
      console.error('Decryption failed', error);
      pushStatus('Failed to decrypt the private key.', 'error');
    } finally {
      setDecryptState('idle');
    }
  }, [account, contractAddress, pushStatus, resetStatus, signer, storedCiphertext, storedHelperHandle, zamaInstance]);

  const helperAddressDisplay = helperAddress ?? 'Not generated yet';
  const contractConfigured = Boolean(contractAddress);

  return (
    <div className="vault-app">
      <Header />
      <main className="vault-content">
        <section className="vault-card">
          <div className="vault-card-header">
            <h2>Generate & Encrypt</h2>
            <p>Create private key A, helper address B, and encrypted payload C.</p>
          </div>
          <div className="vault-section">
            <button className="vault-button" onClick={handleGeneratePrivateKey}>
              Generate Private Key A
            </button>
            {generatedPrivateKey && (
              <div className="vault-field">
                <span className="vault-label">Private Key A</span>
                <code className="vault-code">{generatedPrivateKey}</code>
              </div>
            )}
          </div>
          <div className="vault-section">
            <button
              className="vault-button"
              onClick={handleEncrypt}
              disabled={encryptionState === 'loading' || !generatedPrivateKey}
            >
              {encryptionState === 'loading' ? 'Encrypting…' : 'Encrypt with Helper Address B'}
            </button>
            <div className="vault-field">
              <span className="vault-label">Helper Address B</span>
              <code className="vault-code">{helperAddressDisplay}</code>
            </div>
            {encryptedPrivateKey && (
              <div className="vault-field">
                <span className="vault-label">Encrypted Payload C</span>
                <code className="vault-code">{encryptedPrivateKey}</code>
              </div>
            )}
          </div>
        </section>

        <section className="vault-card">
          <div className="vault-card-header">
            <h2>Store On-Chain</h2>
            <p>Save encrypted payload C and the Zama-encrypted helper address.</p>
          </div>
          <div className="vault-section">
            <div className="vault-field">
              <span className="vault-label">Connected Wallet</span>
              <code className="vault-code">{account ?? 'Not connected'}</code>
            </div>
            <div className="vault-field">
              <span className="vault-label">Vault Contract</span>
              <code className="vault-code">{contractConfigured ? contractAddress : 'Set VITE_VAULT_CONTRACT_ADDRESS'}</code>
            </div>
            {zamaLoading && <p className="vault-note">Initialising encryption service…</p>}
            {zamaError && <p className="vault-error">Encryption service error: {zamaError}</p>}
          </div>
          <button
            className="vault-button primary"
            onClick={handleStoreOnChain}
            disabled={storageState === 'loading' || zamaLoading || !encryptedPrivateKey}
          >
            {storageState === 'loading' ? 'Saving…' : 'Save Encrypted Data'}
          </button>
          {transactionHash && (
            <p className="vault-note">Transaction hash: {transactionHash}</p>
          )}
        </section>

        <section className="vault-card">
          <div className="vault-card-header">
            <h2>Retrieve & Decrypt</h2>
            <p>Load encrypted data from the contract and recover private key A.</p>
          </div>
          <div className="vault-actions">
            <button
              className="vault-button"
              onClick={handleFetchRecord}
              disabled={fetchState === 'loading'}
            >
              {fetchState === 'loading' ? 'Fetching…' : 'Load Encrypted Record'}
            </button>
            <button
              className="vault-button"
              onClick={handleDecrypt}
              disabled={decryptState === 'loading' || !storedCiphertext || !storedHelperHandle}
            >
              {decryptState === 'loading' ? 'Decrypting…' : 'Decrypt Private Key'}
            </button>
          </div>
          {storedCiphertext && (
            <div className="vault-field">
              <span className="vault-label">Stored Encrypted Payload C</span>
              <code className="vault-code">{storedCiphertext}</code>
            </div>
          )}
          {storedHelperHandle && (
            <div className="vault-field">
              <span className="vault-label">Encrypted Helper Handle</span>
              <code className="vault-code">{storedHelperHandle}</code>
            </div>
          )}
          {decryptedPrivateKey && (
            <div className="vault-field">
              <span className="vault-label">Decrypted Private Key A</span>
              <code className="vault-code highlight">{decryptedPrivateKey}</code>
            </div>
          )}
        </section>
      </main>
      {statusMessage && (
        <div className={`vault-status ${statusTone}`}>
          <p>{statusMessage}</p>
        </div>
      )}
    </div>
  );
}
