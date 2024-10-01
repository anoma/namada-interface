import { Input, Stack } from "@namada/components";

import { chain as osmosis } from "chain-registry/mainnet/osmosis";
import { useMemo } from "react";
import namadaShieldedSvg from "./assets/namada-shielded.svg";
import namadaTransparentSvg from "./assets/namada-transparent.svg";

type CustomAddressFormProps = {
  onChangeAddress?: (address: string | undefined) => void;
  customAddress?: string;
  memo?: string;
  onChangeMemo?: (address: string) => void;
};

export const CustomAddressForm = ({
  customAddress,
  onChangeAddress,
  memo,
  onChangeMemo,
}: CustomAddressFormProps): JSX.Element => {
  const iconUrl = useMemo((): string | undefined => {
    if (customAddress?.startsWith("osmo")) return osmosis.logo_URIs?.svg;
    if (customAddress?.startsWith("znam")) return namadaShieldedSvg;
    if (customAddress?.startsWith("tnam")) return namadaTransparentSvg;
    return "";
  }, [customAddress]);

  return (
    <Stack as="fieldset" gap={2}>
      {onChangeAddress && (
        <Input
          label="Recipient address"
          value={customAddress}
          onChange={(e) => onChangeAddress(e.target.value)}
        >
          {iconUrl && (
            <i className="w-6 absolute right-4 top-1/2 -translate-y-1/2">
              <img src={iconUrl} alt="" />
            </i>
          )}
        </Input>
      )}
      {onChangeMemo && (
        <Input
          label="Memo"
          value={memo}
          onChange={(e) => onChangeMemo(e.target.value)}
          placeholder="Required for centralized exchanges"
        />
      )}
    </Stack>
  );
};
