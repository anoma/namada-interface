import { Asset, Chain } from "@chain-registry/types";
import { Stack } from "@namada/components";
import { AccountType } from "@namada/types";
import { shortenAddress } from "@namada/utils";
import { TransactionFee } from "App/Common/TransactionFee";
import { TransactionFeeButton } from "App/Common/TransactionFeeButton";
import { allDefaultAccountsAtom } from "atoms/accounts";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { TransactionFeeProps } from "hooks/useTransactionFee";
import { getChainImageUrl } from "integrations/utils";
import { useAtomValue } from "jotai";
import { Address, WalletProvider } from "types";
import shieldedEye from "./assets/shielded-eye.svg";
import { ConnectProviderButton } from "./ConnectProviderButton";
import { CustomAddressForm } from "./CustomAddressForm";
import { SelectedChain } from "./SelectedChain";
import { SelectedWallet } from "./SelectedWallet";
import { ShieldedPropertiesTooltip } from "./ShieldedPropertiesTooltip";
import { TokenAmountCard } from "./TokenAmountCard";

type TransferDestinationProps = {
  isShieldedAddress?: boolean;
  isShieldedTx?: boolean;
  isSubmitting?: boolean;
  chain?: Chain;
  wallet?: WalletProvider;
  walletAddress?: string;
  gasDisplayAmount?: BigNumber;
  gasAsset?: Asset;
  feeProps?: TransactionFeeProps;
  changeFeeEnabled?: boolean;
  customAddressActive?: boolean;
  destinationAsset?: Asset;
  amount?: BigNumber;
  address?: string;
  memo?: string;
  openProviderSelector?: () => void;
  onChangeAddress?: (address: Address) => void;
  onChangeMemo?: (address: string) => void;
};

export const TransferDestination = ({
  isShieldedAddress,
  isShieldedTx = false,
  isSubmitting,
  chain,
  wallet,
  walletAddress,
  gasDisplayAmount,
  gasAsset,
  feeProps,
  changeFeeEnabled = true,
  customAddressActive,
  destinationAsset,
  amount,
  address,
  memo,
  openProviderSelector,
  onChangeAddress,
  onChangeMemo,
}: TransferDestinationProps): JSX.Element => {
  const { data: accounts } = useAtomValue(allDefaultAccountsAtom);
  const transparentAccount = accounts?.find(
    (account) => account.type !== AccountType.ShieldedKeys
  );
  const shieldedAccount = accounts?.find(
    (account) => account.type === AccountType.ShieldedKeys
  );
  const alias =
    isShieldedTx && shieldedAccount?.alias ?
      shieldedAccount?.alias
    : transparentAccount?.alias;

  return (
    <div
      className={clsx("relative bg-neutral-800 rounded-lg px-4 pt-8 pb-4", {
        "border border-yellow transition-colors duration-200":
          isShieldedAddress,
        "border border-white transition-colors duration-200":
          chain?.chain_name === "namada" && !isShieldedAddress,
      })}
    >
      {!isSubmitting && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="ml-2 text-neutral-500 mb-0.5 font-normal">
              Destination
            </span>
            {isShieldedAddress && (
              <div className="relative w-fit group/tooltip">
                <img
                  src={shieldedEye}
                  alt={wallet?.name + " Logo"}
                  className="w-5 mb-2 select-none cursor-pointer"
                />
                <ShieldedPropertiesTooltip />
              </div>
            )}
          </div>
          {!customAddressActive && (
            <div className="flex justify-between items-center bg-neutral-900 p-2 mt-3 rounded-sm">
              <div className="flex">
                <img
                  src={getChainImageUrl(chain)}
                  alt={chain?.pretty_name}
                  className="w-7"
                />
                <div className="flex flex-col ml-4">
                  {alias ?
                    <div className="flex flex-col">
                      <span className="text-white text-sm -mb-1 font-normal">
                        {alias}
                      </span>
                      <span className="text-neutral-500 font-normal">
                        {shortenAddress(walletAddress ?? "", 15, 15)}
                      </span>
                    </div>
                  : <span className="text-neutral-500 font-normal">
                      {shortenAddress(walletAddress ?? "", 15, 15)}
                    </span>
                  }
                </div>
              </div>
              {!walletAddress && (
                <ConnectProviderButton onClick={openProviderSelector} />
              )}
            </div>
          )}

          {customAddressActive && (
            <Stack gap={8}>
              <CustomAddressForm
                memo={memo}
                onChangeMemo={onChangeMemo}
                customAddress={address}
                onChangeAddress={onChangeAddress}
              />
            </Stack>
          )}
        </div>
      )}

      {isSubmitting && amount && destinationAsset && (
        <div>
          <TokenAmountCard asset={destinationAsset} displayAmount={amount} />
        </div>
      )}

      {isSubmitting && (
        <footer>
          <hr className="mt-4 mb-2.5 mx-2 border-white opacity-[5%]" />
          <div className="flex justify-between items-center gap-4">
            <SelectedChain chain={chain} wallet={wallet} iconSize="36px" />
            {walletAddress && (
              <SelectedWallet
                address={customAddressActive ? address : walletAddress}
                displayFullAddress={false}
              />
            )}
          </div>
        </footer>
      )}

      {!isSubmitting && (
        <footer className="flex mt-10">
          {changeFeeEnabled ?
            feeProps && (
              <TransactionFeeButton
                feeProps={feeProps}
                isShieldedTransfer={isShieldedTx}
              />
            )
          : gasDisplayAmount &&
            gasAsset && (
              <TransactionFee
                displayAmount={gasDisplayAmount}
                symbol={gasAsset.symbol}
              />
            )
          }
        </footer>
      )}
    </div>
  );
};
