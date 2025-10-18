import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { sepolia } from 'wagmi/chains';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '';
const rpcUrl = import.meta.env.VITE_SEPOLIA_RPC_URL || (import.meta.env.VITE_INFURA_API_KEY ? `https://sepolia.infura.io/v3/${import.meta.env.VITE_INFURA_API_KEY}` : undefined);

export const config = getDefaultConfig({
  appName: 'Private Key Vault',
  projectId,
  chains: [sepolia],
  transports: {
    [sepolia.id]: rpcUrl ? http(rpcUrl) : http(),
  },
  ssr: false,
});
