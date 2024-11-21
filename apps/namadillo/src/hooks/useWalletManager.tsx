import { chainRegistryAtom, selectedIBCChainAtom } from "atoms/integrations";
import { WalletConnector } from "integrations/types";
import { findRegistryByChainId } from "integrations/utils";
import { useAtom, useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { ChainRegistryEntry } from "types";

type UseWalletOutput = {
  registry?: ChainRegistryEntry;
  chainId?: string;
  walletAddress?: string;
  connectToChainId: (chainId: string) => Promise<void>;
  setWalletAddress: (walletAddress: string) => void;
  loadWalletAddress: (chainId: string) => Promise<string>;
};

export const useWalletManager = (wallet: WalletConnector): UseWalletOutput => {
  const chainRegistry = useAtomValue(chainRegistryAtom);
  const [walletAddress, setWalletAddress] = useState<string | undefined>();
  const [chainId, setChainId] = useAtom(selectedIBCChainAtom);
  const [registry, setRegistry] = useState<ChainRegistryEntry>();

  useEffect(() => {
    if (chainId) {
      const registry = findRegistryByChainId(chainRegistry, chainId);
      if (registry) {
        connectToChainId(chainId);
        setRegistry(registry);
        return;
      }
    }

    setRegistry(undefined);
  }, [chainId]);

  const connectToChainId = async (chainId: string): Promise<void> => {
    const registry = findRegistryByChainId(chainRegistry, chainId);
    if (!registry) {
      throw "Unknown registry. Tried to search for " + chainId;
    }

    await wallet.connect(registry);
    await loadWalletAddress(chainId);
    setChainId(registry.chain.chain_id);
    setRegistry(registry);
  };

  const loadWalletAddress = async (chainId: string): Promise<string> => {
    const address = await wallet.getAddress(chainId);
    setWalletAddress(address);
    return address;
  };

  return {
    registry,
    chainId,
    walletAddress,
    connectToChainId,
    loadWalletAddress,
    setWalletAddress,
  };
};
