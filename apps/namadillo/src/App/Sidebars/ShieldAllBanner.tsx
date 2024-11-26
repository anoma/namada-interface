import { ActionButton } from "@namada/components";
import svgImg from "App/Assets/ShieldedParty.svg";
import { routes } from "App/routes";
import { applicationFeaturesAtom } from "atoms/settings";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { Link } from "react-router-dom";
import { twMerge } from "tailwind-merge";

export const ShieldAllBanner = (): JSX.Element => {
  const { maspEnabled } = useAtomValue(applicationFeaturesAtom);
  const [isAnimating, setIsAnimating] = useState(false);

  if (!maspEnabled) {
    return <></>;
  }

  return (
    <div
      className={twMerge(
        "bg-yellow rounded-sm h-fit",
        "flex flex-col items-center gap-2",
        "p-3"
      )}
    >
      <img
        className="h-[145px] w-full"
        // hover effect with :target for external loaded svg with <img>
        // https://developer.mozilla.org/en-US/docs/Web/CSS/:target
        // https://gist.github.com/LeaVerou/5198257
        src={`${svgImg}${isAnimating ? "#hover " : ""}`}
      />
      <Link
        to={routes.maspShield}
        onMouseEnter={() => setIsAnimating(true)}
        onMouseLeave={() => setIsAnimating(false)}
      >
        <ActionButton
          as="div"
          className="max-w-[160px]"
          size="sm"
          backgroundColor="black"
          textColor="yellow"
          backgroundHoverColor="yellow"
        >
          Shield Assets
        </ActionButton>
      </Link>
    </div>
  );
};
