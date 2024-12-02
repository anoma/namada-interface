import clsx from "clsx";
import arrowImage from "./assets/arrow.svg";
import shieldedAccountImage from "./assets/shielded-account.svg";
import transparentAccountImage from "./assets/transparent-account.svg";

type NamadaTransferTopHeaderProps = {
  isSourceShielded: boolean;
  isDestinationShielded?: boolean;
};

export const NamadaTransferTopHeader = ({
  isSourceShielded,
  isDestinationShielded,
}: NamadaTransferTopHeaderProps): JSX.Element => {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
      <img
        src={isSourceShielded ? shieldedAccountImage : transparentAccountImage}
        alt=""
        className="flex-1 h-[35px] w-[35px]"
      />
      <img src={arrowImage} alt="" className="flex-1 w-[72px]" />
      <img
        src={
          isDestinationShielded ? shieldedAccountImage : transparentAccountImage
        }
        alt=""
        className={clsx(
          "flex-1 h-[35px] w-[35px]",
          isDestinationShielded === undefined && "opacity-15"
        )}
      />
    </div>
  );
};
