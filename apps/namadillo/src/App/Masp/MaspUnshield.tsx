import { Panel } from "@namada/components";
import { ConnectGate } from "App/Common/ConnectGate";

export const MaspUnshield: React.FC = () => {
  return (
    <ConnectGate
      disconnectedText="To unshield please connect your account"
      missingAccountText="To unshield please create or import an account using Namada keychain"
    >
      <Panel>
        <div className="text-yellow">MASP: Unshield (WIP)</div>
      </Panel>
    </ConnectGate>
  );
};
