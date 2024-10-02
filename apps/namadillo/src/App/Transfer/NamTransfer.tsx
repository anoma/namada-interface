import { Panel } from "@namada/components";
import { ConnectGate } from "App/Common/ConnectGate";
import { Example } from "./Example";

export const NamTransfer: React.FC = () => {
  return (
    <ConnectGate
      disconnectedText="To transfer assets please connect your account"
      missingAccountText="To transfer please create or import an account using Namada keychain"
    >
      <Panel>
        <div className="text-yellow">Transfer: Nam Transfer (WIP)</div>
        <Example />
      </Panel>
    </ConnectGate>
  );
};
