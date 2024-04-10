import { ActionButton, Image } from "@namada/components";
import { Chain } from "@namada/types";
import { ConnectExtensionButton } from "App/Common/ConnectExtensionButton";
import clsx from "clsx";

type IntroProps = {
  chain: Chain;
  hasExtensionInstalled: boolean;
};

export const Intro = ({ chain }: IntroProps): JSX.Element => {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex flex-col gap-5 items-center">
        <Image styleOverrides={{ width: "203px" }} imageName="LogoMinimal" />
        <h2
          className={clsx(
            "uppercase text-center font-medium text-yellow leading-10 text-4xl"
          )}
        >
          Your Gateway to Shielded Multichain
        </h2>
      </div>
      <div className="flex gap-4 w-full">
        <ConnectExtensionButton chain={chain} />
        <ActionButton size="sm" outlined borderRadius="sm">
          Help
        </ActionButton>
      </div>
    </div>
  );
};
