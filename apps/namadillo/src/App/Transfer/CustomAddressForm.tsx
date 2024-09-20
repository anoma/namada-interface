import { Input, Stack } from "@namada/components";

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
  return (
    <Stack as="fieldset" gap={2}>
      {onChangeAddress && (
        <Input
          label="Recipient address"
          value={customAddress}
          onChange={(e) => onChangeAddress(e.target.value)}
        />
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
