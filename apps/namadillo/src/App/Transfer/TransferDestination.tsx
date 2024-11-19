import { Chain } from "@chain-registry/types";
import { Stack } from "@namada/components";
import { TabSelector } from "App/Common/TabSelector";
import clsx from "clsx";
import { Address, WalletProvider } from "types";
import { ConnectProviderButton } from "./ConnectProviderButton";
import { CustomAddressForm } from "./CustomAddressForm";
import { SelectedChain } from "./SelectedChain";
import { SelectedWallet } from "./SelectedWallet";
import { TransactionFee } from "./TransferModule";
import { TransferTransactionFee } from "./TransferTransactionFee";

type TransferDestinationProps = {
  isShielded?: boolean;
  onChangeShielded?: (isShielded: boolean) => void;
  chain?: Chain;
  wallet?: WalletProvider;
  walletAddress?: string;
  className?: string;
  transactionFee?: TransactionFee;
  customAddressActive?: boolean;
  isIbcTransfer?: boolean;
  openChainSelector?: () => void;
  openProviderSelector?: () => void;
  onToggleCustomAddress?: (isActive: boolean) => void;
  onChangeAddress?: (address: Address) => void;
  address?: string;
  memo?: string;
  onChangeMemo?: (address: string) => void;
};

export const TransferDestination = ({
  chain,
  wallet,
  walletAddress,
  isShielded,
  isIbcTransfer,
  onChangeShielded,
  transactionFee,
  customAddressActive,
  onToggleCustomAddress,
  address,
  onChangeAddress,
  memo,
  onChangeMemo,
  openChainSelector,
  openProviderSelector,
}: TransferDestinationProps): JSX.Element => {
  return (
    <div
      className={clsx("relative bg-neutral-800 rounded-lg px-4 pt-8 pb-4", {
        "border border-yellow transition-colors duration-200": isShielded,
        "border border-white transition-colors duration-200":
          chain?.chain_name === "namada" && !isShielded,
      })}
    >
      {onChangeShielded && chain?.chain_name === "namada" && (
        <nav className="mb-6">
          <TabSelector
            active={isShielded ? "shielded" : "transparent"}
            items={[
              { id: "shielded", text: "Shielded", className: "text-yellow" },
              {
                id: "transparent",
                text: "Transparent",
                className: "text-white",
              },
            ]}
            onChange={() => onChangeShielded(!isShielded)}
          />
        </nav>
      )}

      {onToggleCustomAddress && (
        <nav className="mb-6">
          <TabSelector
            active={customAddressActive ? "custom" : "my-address"}
            onChange={() => onToggleCustomAddress(!customAddressActive)}
            items={[
              { id: "my-address", text: "My Address", className: "text-white" },
              { id: "custom", text: "Custom Address", className: "text-white" },
            ]}
          />
        </nav>
      )}

      {!customAddressActive && (
        <div className="flex justify-between items-center">
          <SelectedChain
            chain={chain}
            wallet={wallet}
            onClick={openChainSelector}
            iconSize="42px"
          />
          {!walletAddress && (
            <ConnectProviderButton onClick={openProviderSelector} />
          )}
          {wallet && walletAddress && (
            <SelectedWallet wallet={wallet} address={walletAddress} />
          )}
        </div>
      )}

      {customAddressActive && (
        <Stack gap={8}>
          {onToggleCustomAddress && (
            <SelectedChain
              chain={chain}
              wallet={wallet}
              onClick={openChainSelector}
              iconSize="42px"
            />
          )}
          <CustomAddressForm
            memo={memo}
            onChangeMemo={onChangeMemo}
            customAddress={address}
            onChangeAddress={onChangeAddress}
          />
        </Stack>
      )}
      {transactionFee && (
        <footer className="text-neutral-300">
          <TransferTransactionFee
            transactionFee={transactionFee}
            isIbcTransfer={isIbcTransfer}
          />
        </footer>
      )}
    </div>
  );
};
