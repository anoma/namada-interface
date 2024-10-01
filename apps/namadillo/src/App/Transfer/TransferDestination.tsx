import { Chain } from "@chain-registry/types";
import { Stack } from "@namada/components";
import { NamCurrency } from "App/Common/NamCurrency";
import { TabSelector } from "App/Common/TabSelector";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { WalletProvider } from "types";
import { CustomAddressForm } from "./CustomAddressForm";
import { SelectedChain } from "./SelectedChain";
import { SelectedWallet } from "./SelectedWallet";

type TransferDestinationProps = {
  isShielded?: boolean;
  onChangeShielded?: (isShielded: boolean) => void;
  chain?: Chain;
  wallet?: WalletProvider;
  className?: string;
  transactionFee?: BigNumber;
  customAddressActive?: boolean;
  openChainSelector?: () => void;
  onToggleCustomAddress?: (isActive: boolean) => void;
  onChangeAddress?: (address: string | undefined) => void;
  address?: string;
  memo?: string;
  onChangeMemo?: (address: string) => void;
};

export const TransferDestination = ({
  chain,
  wallet,
  isShielded,
  onChangeShielded,
  transactionFee,
  customAddressActive,
  onToggleCustomAddress,
  address,
  onChangeAddress,
  memo,
  onChangeMemo,
  openChainSelector,
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
          {wallet && <SelectedWallet wallet={wallet} isShielded={isShielded} />}
        </div>
      )}

      {customAddressActive && (
        <Stack gap={8}>
          <SelectedChain
            chain={chain}
            wallet={wallet}
            onClick={openChainSelector}
            iconSize="42px"
          />
          <CustomAddressForm
            memo={memo}
            onChangeMemo={onChangeMemo}
            customAddress={address}
            onChangeAddress={onChangeAddress}
          />
        </Stack>
      )}

      {transactionFee && (
        <footer className="flex justify-between mt-12 text-sm text-neutral-300">
          <span className="underline">Transaction Fee</span>
          <NamCurrency amount={transactionFee} />
        </footer>
      )}
    </div>
  );
};
