import { Panel } from "@namada/components";
import { ConnectPanel } from "App/Common/ConnectPanel";

export const IbcWithdraw: React.FC = () => {
  return (
    <ConnectPanel
      disconnectedText="To withdraw please connect your account"
      missingAccountText="To withdraw please create or import an account using Namada keychain"
    >
      <Panel>
        <div className="text-yellow">IBC: Withdraw (WIP)</div>
      </Panel>
    </ConnectPanel>
  );
};
