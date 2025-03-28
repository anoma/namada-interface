import { Input, Stack } from "@namada/components";

import { Chain } from "@chain-registry/types";
import { chain as osmosis } from "chain-registry/mainnet/osmosis";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import namadaShieldedSvg from "./assets/namada-shielded.svg";
import namadaTransparentSvg from "./assets/namada-transparent.svg";

const bech32PrefixMap: Record<string, string> = {
  osmo: "osmo",
  znam: "namada",
  tnam: "namada",
  cosmos: "cosmos",
};

type CustomAddressFormProps = {
  onChangeAddress?: (address: string) => void;
  customAddress?: string;
  memo?: string;
  onChangeMemo?: (address: string) => void;
  chain?: Chain;
  setIsDisabled?: Dispatch<SetStateAction<boolean>>;
};

export const CustomAddressForm = ({
  customAddress,
  onChangeAddress,
  memo,
  onChangeMemo,
  setIsDisabled,
  chain,
}: CustomAddressFormProps): JSX.Element => {
  const [addressError, setAddressError] = useState<string | null>(null);

  const iconUrl = useMemo((): string | undefined => {
    if (customAddress?.startsWith("osmo")) return osmosis.logo_URIs?.svg;
    if (customAddress?.startsWith("znam")) return namadaShieldedSvg;
    if (customAddress?.startsWith("tnam")) return namadaTransparentSvg;
    return "";
  }, [customAddress]);

  const getAddressPrefix = (address: string): string | undefined => {
    return Object.keys(bech32PrefixMap).find((p) => address.startsWith(p));
  };

  const checkIfAddressMatchesChain = (
    address: string,
    chain: Chain | undefined
  ): boolean => {
    if (!chain || !address) return false;
    const prefix = getAddressPrefix(address);
    return prefix ? bech32PrefixMap[prefix] === chain.bech32_prefix : false;
  };

  return (
    <Stack as="fieldset" gap={2}>
      {onChangeAddress && (
        <>
          <Input
            label="Recipient address"
            value={customAddress}
            onChange={(e) => {
              const enteredAddress = e.target.value;
              onChangeAddress(enteredAddress);
              if (checkIfAddressMatchesChain(enteredAddress, chain)) {
                setAddressError(null);
              } else if (enteredAddress) {
                const prefix = chain?.bech32_prefix;
                setAddressError(`Only ${prefix} addresses are allowed`);
                setIsDisabled?.(true);
              } else {
                setAddressError(null);
                setIsDisabled?.(false);
              }
            }}
            error={!!addressError}
          >
            {iconUrl && (
              <i className="w-6 absolute right-4 top-1/2 -translate-y-1/2">
                <img src={iconUrl} alt="" />
              </i>
            )}
          </Input>
          {addressError && (
            <p className="text-sm text-fail mt-[-4px]">{addressError}</p>
          )}
        </>
      )}
      {onChangeMemo && (
        <Input
          label="Memo"
          value={memo}
          onChange={(e) => {
            return onChangeMemo(e.target.value);
          }}
          placeholder="Required for centralized exchanges"
        />
      )}
    </Stack>
  );
};
