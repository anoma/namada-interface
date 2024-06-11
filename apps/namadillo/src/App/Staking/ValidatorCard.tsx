import { WalletAddress } from "App/Common/WalletAddress";
import { ValidatorAliasPlaceholder } from "App/Staking/ValidatorAliasPlaceholder";
import { Validator } from "slices/validators";
import { ValidatorThumb } from "./ValidatorThumb";

type ValidatorCardProps = {
  validator: Validator;
  showAddress?: boolean;
  hasStake?: boolean;
};

export const ValidatorCard = ({
  validator,
  showAddress = true,
  hasStake,
}: ValidatorCardProps): JSX.Element => {
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
        {validator.alias ?
          <strong className="font-medium">{validator.alias}</strong>
        : <span className="block mb-1">
            <ValidatorAliasPlaceholder />
          </span>
        }
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
