import { ExtensionRequester } from "extension";
import React from "react";
import { LedgerViewContainer } from "./Ledger.components";

type Props = {
  requester: ExtensionRequester;
};

const Ledger: React.FC<Props> = ({ requester }) => {
  console.log({ requester });
  return (
    <LedgerViewContainer>
      <h1>Connect Ledger</h1>
      <p>
        <i>TODO</i>
      </p>
    </LedgerViewContainer>
  );
};

export default Ledger;
