import { Panel } from "@namada/components";
import { ConnectPanel } from "App/Common/ConnectPanel";

export const MaspShield: React.FC = () => {
  return (
    <ConnectPanel
      disconnectedText="To shield please connect your account"
      missingAccountText="To shield please create or import an account using Namada keychain"
    >
      <Panel>
        <div className="text-yellow">MASP: Shield (WIP)</div>
      </Panel>
    </ConnectPanel>
  );
};
