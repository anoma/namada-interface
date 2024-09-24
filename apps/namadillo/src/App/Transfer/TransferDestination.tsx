import { Chain } from "@chain-registry/types";
import { NamCurrency } from "App/Common/NamCurrency";
import { TabSelector } from "App/Common/TabSelector";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { WalletProvider } from "types";
import namadaShieldedSvg from "./assets/namada-shielded.svg";
import namadaTransparentSvg from "./assets/namada-transparent.svg";
import { CustomAddressForm } from "./CustomAddressForm";
import { SelectedChain } from "./SelectedChain";

type TransferDestinationProps = {
  isShielded?: boolean;
  onChangeShielded?: (isShielded: boolean) => void;
  chain?: Chain;
  wallet?: WalletProvider;
  className?: string;
  transactionFee?: BigNumber;
  customAddressActive?: boolean;
  onToggleCustomAddress?: (isActive: boolean) => void;
  onChangeAddress?: (address: string | undefined) => void;
  address?: string;
  memo?: string;
  onChangeMemo?: (address: string) => void;
};

const parseChainInfo = (
  chain?: Chain,
  isShielded?: boolean
): Chain | undefined => {
  if (chain?.chain_name !== "namada") {
    return chain;
  }
  return {
    ...chain,
    pretty_name: isShielded ? "Namada Shielded" : "Namada Transparent",
    logo_URIs: {
      ...chain.logo_URIs,
      svg: isShielded ? namadaShieldedSvg : namadaTransparentSvg,
    },
  };
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
}: TransferDestinationProps): JSX.Element => {
  return (
    <div
      className={clsx("relative bg-neutral-800 rounded-lg px-4 py-5", {
        "border-yellow": isShielded,
      })}
    >
      {onChangeShielded && chain?.chain_name === "namada" && (
        <TabSelector
          active={isShielded ? "shielded" : "transparent"}
          items={[
            { id: "shielded", text: "Shielded", className: "text-yellow" },
            { id: "transparent", text: "Transparent", className: "text-white" },
          ]}
          onChange={() => onChangeShielded(!isShielded)}
        />
      )}

      {onToggleCustomAddress && (
        <TabSelector
          active={customAddressActive ? "custom" : "my-address"}
          onChange={() => onToggleCustomAddress(!customAddressActive)}
          items={[
            { id: "my-address", text: "My Address", className: "text-white" },
            { id: "custom", text: "Custom Address", className: "text-white" },
          ]}
        />
      )}

      <SelectedChain
        chain={parseChainInfo(chain, isShielded)}
        wallet={wallet}
      />

      {customAddressActive && (
        <CustomAddressForm
          memo={memo}
          onChangeMemo={onChangeMemo}
          customAddress={address}
          onChangeAddress={onChangeAddress}
        />
      )}

      {transactionFee && (
        <footer className="flex justify-between mt-12 text-sm">
          <span className="underline">Transaction Fee</span>
          <NamCurrency amount={transactionFee} />
        </footer>
      )}
    </div>
  );
};
