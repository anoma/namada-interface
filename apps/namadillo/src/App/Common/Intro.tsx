import { ActionButton, Image } from "@namada/components";
import { ConnectExtensionButton } from "App/Common/ConnectExtensionButton";
import clsx from "clsx";
import { DISCORD_URL } from "urls";

export const Intro = (): JSX.Element => {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex flex-col gap-5 items-center">
        <Image styleOverrides={{ width: "203px" }} imageName="LogoMinimal" />
        <h2
          className={clsx(
            "uppercase text-center font-medium text-yellow leading-10 text-4xl"
          )}
        >
          Your Gateway to the Shielded Multichain
        </h2>
      </div>
      <div className="flex gap-4 w-full">
        <ConnectExtensionButton />
        <ActionButton
          href={DISCORD_URL}
          target="_blank"
          rel="noreferrer"
          size="sm"
          outlineColor="yellow"
        >
          Community Help
        </ActionButton>
      </div>
    </div>
  );
};
