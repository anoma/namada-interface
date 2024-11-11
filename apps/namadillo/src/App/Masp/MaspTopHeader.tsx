import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import arrowImage from "./assets/arrow.svg";
import shieldedNamImage from "./assets/shielded-account.png";
import tokenImage from "./assets/token.svg";
import transparentNamImage from "./assets/transparent-account.png";

type MaspTopHeaderProps = {
  type: "unshield" | "shield";
  isShielded: boolean;
};

export const MaspTopHeader = ({
  type,
  isShielded,
}: MaspTopHeaderProps): JSX.Element => {
  const namadaImage = isShielded ? shieldedNamImage : transparentNamImage;
  const images =
    type === "unshield" ?
      [namadaImage, tokenImage, transparentNamImage]
    : [transparentNamImage, tokenImage, namadaImage];

  return (
    <span className={"flex items-center gap-3 h-10"}>
      <img
        src={images[0]}
        alt=""
        className={twMerge(
          clsx("w-5", {
            "w-9 -mx-2": isShielded && type === "unshield",
          })
        )}
      />
      <img src={arrowImage} alt="" />
      <img src={images[1]} alt="" className="w-10" />
      <img src={arrowImage} alt="" />
      <img
        src={images[2]}
        className={twMerge(
          clsx("w-5", { "w-9 -mx-2": isShielded && type === "shield" })
        )}
        alt=""
      />
    </span>
  );
};
