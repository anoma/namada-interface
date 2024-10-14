import { Panel } from "@namada/components";
import { ConnectExtensionButton } from "App/Common/ConnectExtensionButton";
import { useConnectText } from "hooks/useConnectText";

export const ConnectBanner = ({
  actionText,
}: {
  actionText?: string;
}): JSX.Element => {
  const connectText = useConnectText();

  return (
    <Panel className="border border-yellow py-3">
      <div className="grid grid-cols-[auto_max-content] items-center">
        <div className="w-full text-yellow text-xl">
          {actionText} {connectText}
        </div>
        <ConnectExtensionButton />
      </div>
    </Panel>
  );
};
