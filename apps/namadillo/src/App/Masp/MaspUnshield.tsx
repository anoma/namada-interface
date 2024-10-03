import { Panel } from "@namada/components";
import { ConnectPanel } from "App/Common/ConnectPanel";

export const MaspUnshield: React.FC = () => {
  return (
    <ConnectPanel
      disconnectedText="To unshield please connect your account"
      missingAccountText="To unshield please create or import an account using Namada keychain"
    >
      <Panel>
        <div className="text-yellow">MASP: Unshield (WIP)</div>
      </Panel>
    </ConnectPanel>
  );
};
