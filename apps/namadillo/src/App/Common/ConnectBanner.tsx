import { Panel } from "@namada/components";
import { ConnectExtensionButton } from "App/Common/ConnectExtensionButton";

type ConnectBannerProps = {
  text: string;
};

export const ConnectBanner = ({ text }: ConnectBannerProps): JSX.Element => {
  return (
    <Panel className="border border-yellow py-3">
      <div className="grid grid-cols-[auto_max-content] items-center pl-15">
        <div className="w-full text-yellow text-xl">{text}</div>
        <ConnectExtensionButton />
      </div>
    </Panel>
  );
};
