import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';
import { http } from 'wagmi';

// Configure wagmi with RainbowKit
export const wagmiConfig = getDefaultConfig({
  appName: 'StormlineAuction',
  projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
  ssr: false,
});

// Export chain for use in components
export const defaultChain = sepolia;
