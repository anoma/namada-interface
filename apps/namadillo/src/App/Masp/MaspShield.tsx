import { Panel } from "@namada/components";
import { ConnectGate } from "App/Common/ConnectGate";

export const MaspShield: React.FC = () => {
  return (
    <ConnectGate
      disconnectedText="To shield please connect your account"
      missingAccountText="To shield please create or import an account using Namada keychain"
    >
      <Panel>
        <div className="text-yellow">MASP: Shield (WIP)</div>
      </Panel>
    </ConnectGate>
  );
};
