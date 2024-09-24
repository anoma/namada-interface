import { chain as celestia } from "chain-registry/mainnet/celestia";
import { chain as cosmos } from "chain-registry/mainnet/cosmoshub";
import { chain as dydx } from "chain-registry/mainnet/dydx";
import { chain as osmosis } from "chain-registry/mainnet/osmosis";
import { chain as stargaze } from "chain-registry/mainnet/stargaze";
import { chain as stride } from "chain-registry/mainnet/stride";

import { integrations } from "@namada/integrations";
import { selectedIBCChainAtom, selectedIBCWallet } from "atoms/integrations";
import { wallets } from "integrations";
import { useAtom } from "jotai";
import { WalletProvider } from "types";
import { TransferModule } from "./TransferModule";

export const IBCFromNamadaModule = (): JSX.Element => {
  const [selectedWallet, setWallet] = useAtom(selectedIBCWallet);
  const [chainId, setChainId] = useAtom(selectedIBCChainAtom);
  const sourceChains = [cosmos, osmosis, celestia, dydx, stride, stargaze];

  return (
    <div>
      <TransferModule
        isConnected={false}
        onSubmitTransfer={() => {}}
        availableWallets={Object.values(wallets)}
        selectedWallet={selectedWallet ? wallets[selectedWallet] : undefined}
        onChangeWallet={async (wallet: WalletProvider) => {
          try {
            await integrations[wallet.id].connect();
            setWallet(wallet.id);
            if (!chainId) {
              setChainId(cosmos.chain_id);
            }
          } catch (err) {
            console.error(err);
          }
        }}
        onChangeSourceChain={(chain) => setChainId(chain.chain_id)}
        availableSourceChains={sourceChains}
      />
    </div>
  );
};
