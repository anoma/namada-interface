import { ActionButton, Image, Panel } from "@namada/components";
import { ConnectExtensionButton } from "App/Common/ConnectExtensionButton";
import { namadaExtensionConnectedAtom } from "atoms/settings";
import { useUserHasAccount } from "hooks/useUserHasAccount";
import { useAtomValue } from "jotai";
import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { DISCORD_URL } from "urls";

export const ConnectPanel = ({
  disconnectedText,
  missingAccountText,
  children,
}: {
  disconnectedText?: string;
  missingAccountText?: string;
  children?: ReactNode;
}): JSX.Element => {
  const isConnected = useAtomValue(namadaExtensionConnectedAtom);
  const hasAccount = useUserHasAccount();

  if (!isConnected || hasAccount === false) {
    return (
      <Panel
        className={twMerge(
          "p-8 min-h-full",
          "flex items-center justify-center min-h-full",
          "flex flex-col items-center justify-center gap-8"
        )}
      >
        <Image styleOverrides={{ width: "203px" }} imageName="LogoMinimal" />
        <h2
          className={
            "max-w-[500px] uppercase text-center font-medium text-yellow leading-10 text-4xl"
          }
        >
          {!isConnected ?
            disconnectedText
          : !hasAccount ?
            missingAccountText
          : ""}
        </h2>
        <div className="flex gap-4 mx-auto w-full max-w-[400px]">
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
      </Panel>
    );
  }

  return <>{children}</>;
};
