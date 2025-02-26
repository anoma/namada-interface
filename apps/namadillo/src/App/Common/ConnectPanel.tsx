import { ActionButton, Image, Panel } from "@namada/components";
import { ConnectExtensionButton } from "App/Common/ConnectExtensionButton";
import { routes } from "App/routes";
import { useConnectText } from "hooks/useConnectText";
import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
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
  const { pathname } = useLocation();
  const overviewPage = pathname === routes.root;

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
        {actionText} {!overviewPage && connectText}
      </h2>
      {overviewPage && (
        <h4
          className={
            "max-w-[500px] my-0 uppercase text-center font-medium text-yellow selection:bg-yellow selection:text-black text-xl -translate-y-4"
          }
        >
          {connectText}
        </h4>
      )}
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
