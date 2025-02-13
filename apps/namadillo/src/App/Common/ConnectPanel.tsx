import { ActionButton, Image, Panel } from "@namada/components";
import { ConnectExtensionButton } from "App/Common/ConnectExtensionButton";
import { useConnectText } from "hooks/useConnectText";
import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { DISCORD_URL } from "urls";

export const ConnectPanel = ({
  children,
  actionText,
}: {
  children?: ReactNode;
  actionText?: string;
}): JSX.Element => {
  const connectText = useConnectText();

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
          "max-w-[500px] uppercase text-center font-medium text-yellow selection:bg-yellow selection:text-black leading-10 text-4xl"
        }
      >
        {children}
        {actionText} {connectText}
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
};
