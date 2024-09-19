import cosmos from "@namada/chains/chains/cosmos";
import { integrations } from "@namada/integrations";
import { selectedIBCChainAtom, selectedIBCWallet } from "atoms/integrations";
import { wallets } from "integrations";
import { useAtom } from "jotai";
import { WalletProvider } from "types";
import { TransferModule } from "./TransferModule";

export const IBCFromNamadaModule = (): JSX.Element => {
  const [selectedWallet, setWallet] = useAtom(selectedIBCWallet);
  const [chainId, setChainId] = useAtom(selectedIBCChainAtom);

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
              setChainId(cosmos.chainId);
            }
          } catch (err) {
            console.error(err);
          }
        }}
      />
    </div>
  );
};
