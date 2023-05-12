import React from "react";

import {
  ImportAccountViewContainer,
  ImportAccountViewUpperPartContainer,
  Header1,
  BodyText,
} from "./ImportAccount.components";

const ImportAccount: React.FC = () => {
  return (
    <ImportAccountViewContainer>
      <ImportAccountViewUpperPartContainer>
        <Header1>Import Account</Header1>
        <BodyText>
          Import account from mnemonic.{" "}
          <b>
            <i>TBD</i>
          </b>
        </BodyText>
      </ImportAccountViewUpperPartContainer>
    </ImportAccountViewContainer>
  );
};

export default ImportAccount;
