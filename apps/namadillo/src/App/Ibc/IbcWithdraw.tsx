import { Panel } from "@namada/components";
import { ConnectGate } from "App/Common/ConnectGate";

export const IbcWithdraw: React.FC = () => {
  return (
    <ConnectGate
      disconnectedText="To withdraw please connect your account"
      missingAccountText="To withdraw please create or import an account using Namada keychain"
    >
      <Panel>
        <div className="text-yellow">IBC: Withdraw (WIP)</div>
      </Panel>
    </ConnectGate>
  );
};
