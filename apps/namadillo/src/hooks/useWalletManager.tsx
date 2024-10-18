import { selectedIBCChainAtom } from "atoms/integrations";
import { WalletInterface } from "integrations/types";
import { findRegistryByChainId } from "integrations/utils";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { ChainRegistryEntry } from "types";

type UseWalletUtilsProps = {
  wallet: WalletInterface;
  knownChains: Record<string, ChainRegistryEntry>;
};

type UseWalletOutput = {
  registry?: ChainRegistryEntry;
  chainId?: string;
  walletAddress?: string;
  connectToChainId: (chainId: string) => Promise<void>;
  setWalletAddress: (walletAddress: string) => void;
  loadWalletAddress: (chainId: string) => Promise<string>;
};

export const useWalletManager = ({
  wallet,
  knownChains,
}: UseWalletUtilsProps): UseWalletOutput => {
  const [walletAddress, setWalletAddress] = useState<string | undefined>();
  const [chainId, setChainId] = useAtom(selectedIBCChainAtom);
  const [registry, setRegistry] = useState<ChainRegistryEntry>();

  useEffect(() => {
    if (!chainId) {
      setRegistry(undefined);
      return;
    }

    const registry = findRegistryByChainId(knownChains, chainId);
    if (registry) {
      connectToChainId(chainId);
      setRegistry(registry);
    }
  }, [chainId]);

  const connectToChainId = async (chainId: string): Promise<void> => {
    const registry = findRegistryByChainId(knownChains, chainId);
    if (!registry) {
      throw "Unknown registry. Tried to search for " + chainId;
    }

    await wallet.connect(registry);
    await loadWalletAddress(chainId);
    setChainId(registry.chain.chain_id);
    setRegistry(registry);
  };

  const loadWalletAddress = async (chainId: string): Promise<string> => {
    const address = await wallet.loadWalletAddress(chainId);
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
