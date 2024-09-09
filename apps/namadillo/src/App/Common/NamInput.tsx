import { AmountInput } from "@namada/components";
import { Tokens } from "@namada/types";

export type NamInputProps = Omit<
  React.ComponentProps<typeof AmountInput>,
  "maxDecimalPlaces"
>;

export const NamInput: React.FC<NamInputProps> = (props) => (
  <AmountInput {...props} maxDecimalPlaces={Tokens.NAM.decimals} />
);
