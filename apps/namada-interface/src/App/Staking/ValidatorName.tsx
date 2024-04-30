import { shortenAddress } from "@namada/utils";
import clsx from "clsx";
import { PiStackBold } from "react-icons/pi";
import { Validator } from "slices/validators";

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
      <aside className="relative">
        <img
          key={`validator-image-${validator.uuid}`}
          src={validator.imageUrl}
          className="rounded-full aspect-square max-w-8"
        />
        {hasStake && (
          <i
            className={clsx(
              "absolute -top-0.5 -right-1 rounded-full bg-yellow",
              "flex items-center justify-center text-black text-[10px] p-0.5"
            )}
          >
            <PiStackBold />
          </i>
        )}
      </aside>
      <span className="leading-tight">
        {validator.alias}
        {showAddress && (
          <small className="block text-xs text-neutral-500">
            {shortenAddress(validator.address, 6, 12)}
          </small>
        )}
      </span>
    </div>
  );
};

export default ValidatorName;
