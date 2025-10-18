import { ethers } from 'ethers';

const encoder = new TextEncoder();

async function deriveAesKey(helperAddress: string) {
  if (!window?.crypto?.subtle) {
    throw new Error('WebCrypto API is unavailable in this environment');
  }

  const normalized = helperAddress.toLowerCase();
  const digest = await window.crypto.subtle.digest('SHA-256', encoder.encode(normalized));

  return window.crypto.subtle.importKey(
    'raw',
    digest,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptPrivateKeyWithAddress(privateKey: string, helperAddress: string): Promise<string> {
  const aesKey = await deriveAesKey(helperAddress);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const plaintext = ethers.getBytes(privateKey);

  const ciphertext = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, plaintext);
  const ciphertextBytes = new Uint8Array(ciphertext);

  const combined = new Uint8Array(iv.length + ciphertextBytes.length);
  combined.set(iv, 0);
  combined.set(ciphertextBytes, iv.length);

  return ethers.hexlify(combined);
}

export async function decryptPrivateKeyWithAddress(helperAddress: string, ciphertextHex: string): Promise<string> {
  const bytes = ethers.getBytes(ciphertextHex);
  if (bytes.length <= 12) {
    throw new Error('Encrypted payload is malformed');
  }

  const aesKey = await deriveAesKey(helperAddress);
  const iv = bytes.slice(0, 12);
  const cipherBytes = bytes.slice(12);

  const plaintext = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, aesKey, cipherBytes);

  return ethers.hexlify(new Uint8Array(plaintext));
}
