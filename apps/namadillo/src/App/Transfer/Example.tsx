import BigNumber from "bignumber.js";
import { useEffect, useState } from "react";

// This can be loaded async using @chain-registry/client
import {
  chain as celestia,
  assets as celestiaAssets,
} from "chain-registry/mainnet/celestia";
import {
  chain as cosmos,
  assets as cosmosAssets,
} from "chain-registry/mainnet/cosmoshub";
import {
  chain as dydx,
  assets as dydxAssets,
} from "chain-registry/mainnet/dydx";
import {
  chain as osmosis,
  assets as osmosisAssets,
} from "chain-registry/mainnet/osmosis";
import {
  chain as stargaze,
  assets as stargazeAssets,
} from "chain-registry/mainnet/stargaze";
import {
  chain as stride,
  assets as strideAssets,
} from "chain-registry/mainnet/stride";

// This will be replaced by namada registry in the future
import namadaChain from "registry/namada.json";

import { Asset, Chain } from "@chain-registry/types";
import { Panel } from "@namada/components";
import { integrations } from "@namada/integrations";
import { selectedIBCChainAtom, selectedIBCWallet } from "atoms/integrations";
import { wallets } from "integrations";
import { useAtom } from "jotai";
import { useMemo } from "react";
import { WalletProvider } from "types";
import { TransferModule } from "./TransferModule";

export const Example = (): JSX.Element => {
  const [selectedWallet, setWallet] = useAtom(selectedIBCWallet);
  const [chainId, setChainId] = useAtom(selectedIBCChainAtom);
  const [selectedAsset, setSelectedAsset] = useState<Asset>();
  const [isShielded, setShielded] = useState(true);

  const sourceChainConfig: [Chain, Asset[]][] = [
    [cosmos, cosmosAssets.assets],
    [osmosis, osmosisAssets.assets],
    [celestia, celestiaAssets.assets],
    [dydx, dydxAssets.assets],
    [stride, strideAssets.assets],
    [stargaze, stargazeAssets.assets],
  ];

  const sourceChains: Record<string, Chain> = useMemo(() => {
    return sourceChainConfig.reduce((prev, current) => {
      return {
        ...prev,
        [current[0].chain_id]: current[0],
      };
    }, {});
  }, []);

  const availableAssets: Asset[] | undefined = useMemo(() => {
    if (!chainId) return;
    const config = sourceChainConfig.find(
      (config) => config[0].chain_id === chainId
    );
    if (config) {
      return config[1];
    }
  }, [chainId]);

  const selectedSourceChain =
    chainId && chainId in sourceChains ? sourceChains[chainId] : undefined;

  useEffect(() => {
    const config = sourceChainConfig.find(
      (config) => config[0].chain_id === chainId
    );

    if (config) {
      setSelectedAsset(config[1][0]);
    }
  }, [chainId]);

  const onChangeWallet = async (wallet: WalletProvider): Promise<void> => {
    try {
      await integrations[wallet.id].connect();
      setWallet(wallet.id);
      if (!chainId) {
        setChainId(cosmos.chain_id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Panel className="py-20">
      <TransferModule
        source={{
          connected: true,
          wallet: selectedWallet ? wallets[selectedWallet] : undefined,
          onChangeWallet,
          availableWallets: Object.values(wallets),
          onChangeChain: (chain) => setChainId(chain.chain_id),
          onChangeSelectedAsset: setSelectedAsset,
          availableChains: Object.values(sourceChains),
          availableAmount: new BigNumber(100),
          chain: selectedSourceChain,
          availableAssets,
          selectedAsset,
        }}
        destination={{
          connected: true,
          chain: namadaChain as Chain,
          availableWallets: [wallets.namada!],
          wallet: wallets.namada,
          isShielded,
          onChangeShielded: setShielded,
        }}
        transactionFee={new BigNumber(0.01)}
        onSubmitTransfer={console.log}
      />
    </Panel>
  );
};
