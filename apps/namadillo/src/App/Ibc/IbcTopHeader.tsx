import tokenImage from "App/Common/assets/token.svg";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import arrowImage from "./assets/arrow.svg";
import ibcImage from "./assets/ibc.png";
import shieldedNamImage from "./assets/shielded-account.png";
import transparentNamImage from "./assets/transparent-account.png";

type IbcTopHeaderProps = {
  type: "namToIbc" | "ibcToNam";
  isShielded: boolean;
};

export const IbcTopHeader = ({
  type,
  isShielded,
}: IbcTopHeaderProps): JSX.Element => {
  const namadaImage = isShielded ? shieldedNamImage : transparentNamImage;
  const images =
    type === "namToIbc" ?
      [namadaImage, ibcImage, tokenImage]
    : [tokenImage, ibcImage, namadaImage];

  return (
    <span className={"flex items-center gap-3 h-10"}>
      <img
        src={images[0]}
        alt=""
        className={twMerge(
          clsx("w-5", {
            "w-9 -mx-2": isShielded && type === "namToIbc",
          })
        )}
      />
      <img src={arrowImage} alt="" />
      <img src={images[1]} alt="" className="w-10" />
      <img src={arrowImage} alt="" />
      <img
        src={images[2]}
        className={twMerge(
          clsx("w-5", { "w-9 -mx-2": isShielded && type === "ibcToNam" })
        )}
        alt=""
      />
    </span>
  );
};
