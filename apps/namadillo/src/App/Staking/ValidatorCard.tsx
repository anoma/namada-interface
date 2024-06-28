import { WalletAddress } from "App/Common/WalletAddress";
import clsx from "clsx";
import { Validator } from "types";
import { ValidatorAlias } from "./ValidatorAlias";
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
        <span className={clsx("block", { "mb-0.5": !validator.alias })}>
          <ValidatorAlias alias={validator.alias} />
        </span>
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
