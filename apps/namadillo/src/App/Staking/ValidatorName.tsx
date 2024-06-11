import { WalletAddress } from "App/Common/WalletAddress";
import { Validator } from "slices/validators";
import { ValidatorThumb } from "./ValidatorThumb";

type ValidatorNameProps = {
  validator: Validator;
  showAddress?: boolean;
  hasStake?: boolean;
};

export const ValidatorName = ({
  validator,
  showAddress = true,
  hasStake,
}: ValidatorNameProps): JSX.Element => {
  return (
    <div className="flex items-center gap-4">
      <aside>
        <ValidatorThumb
          imageUrl={validator.imageUrl}
          alt={validator.alias || validator.address}
          hasStake={hasStake}
        />
      </aside>
      <span className="leading-tight">
        <strong className="font-medium">{validator.alias}</strong>
        {showAddress && (
          <small className="block text-xs text-neutral-500">
            <WalletAddress
              address={validator.address}
              className="-left-4 translate-x-0"
              prefixLength={6}
              suffixLength={12}
            />
          </small>
        )}
      </span>
    </div>
  );
};
