export const vaultContract = {
  address: (import.meta.env.VITE_VAULT_CONTRACT_ADDRESS || '') as string,
  abi: [
    {
      inputs: [],
      name: 'EmptyEncryptedPrivateKey',
      type: 'error',
    },
    {
      inputs: [],
      name: 'RecordNotFound',
      type: 'error',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'owner',
          type: 'address',
        },
      ],
      name: 'KeyRecordCleared',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'owner',
          type: 'address',
        },
      ],
      name: 'KeyRecordStored',
      type: 'event',
    },
    {
      inputs: [],
      name: 'clearKeyRecord',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'owner',
          type: 'address',
        },
      ],
      name: 'getEncryptedHelperAddress',
      outputs: [
        {
          internalType: 'eaddress',
          name: '',
          type: 'bytes32',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'owner',
          type: 'address',
        },
      ],
      name: 'getEncryptedPrivateKey',
      outputs: [
        {
          internalType: 'bytes',
          name: '',
          type: 'bytes',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'owner',
          type: 'address',
        },
      ],
      name: 'hasKeyRecord',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'protocolId',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'pure',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'externalEaddress',
          name: 'encryptedAddress',
          type: 'bytes32',
        },
        {
          internalType: 'bytes',
          name: 'encryptedPrivateKey',
          type: 'bytes',
        },
        {
          internalType: 'bytes',
          name: 'inputProof',
          type: 'bytes',
        },
      ],
      name: 'storeKeyRecord',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ] as const,
} as const;

export type VaultContractAbi = typeof vaultContract.abi;
