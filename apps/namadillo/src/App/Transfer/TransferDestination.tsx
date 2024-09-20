import { NamCurrency } from "App/Common/NamCurrency";
import { TabSelector } from "App/Common/TabSelector";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { Chain, Provider } from "types";
import namadaShieldedSvg from "./assets/namada-shielded.svg";
import namadaTransparentSvg from "./assets/namada-transparent.svg";
import { CustomAddressForm } from "./CustomAddressForm";
import { SelectedChain } from "./SelectedChain";

type TransferDestinationProps = {
  isShielded?: boolean;
  onChangeShielded?: (isShielded: boolean) => void;
  chain?: Chain;
  provider?: Provider;
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
  if (chain?.name !== "Namada") {
    return chain;
  }
  return {
    ...chain,
    name: isShielded ? "Namada Shielded" : "Namada Transparent",
    iconUrl: isShielded ? namadaShieldedSvg : namadaTransparentSvg,
  };
};

export const TransferDestination = ({
  chain,
  provider,
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
      {onChangeShielded && chain?.name === "Namada" && (
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
        provider={provider}
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
