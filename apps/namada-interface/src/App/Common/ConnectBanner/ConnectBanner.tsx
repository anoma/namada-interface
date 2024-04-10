import { Panel } from "@namada/components";
import { useAtomValue } from "jotai";
import { chainAtom } from "slices/chain";
import { ConnectExtensionButton } from "../ConnectExtensionButton";

type ConnectBannerProps = {
  text: string;
};

const ConnectBanner = ({ text }: ConnectBannerProps): JSX.Element => {
  const chain = useAtomValue(chainAtom);
  return (
    <Panel className="border border-yellow py-3">
      <div className="grid grid-cols-[auto_max-content] items-center pl-15">
        <div className="w-full text-yellow text-xl">{text}</div>
        <ConnectExtensionButton chain={chain} />
      </div>
    </Panel>
  );
};

export default ConnectBanner;
