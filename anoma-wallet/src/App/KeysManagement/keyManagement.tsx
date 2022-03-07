import React from "react";
import { useContext } from "react";
import { ThemeContext } from "styled-components";
import {
  MainSectionContainer,
  TopSection,
  HeadlineSectionContainer,
  Headline,
} from "./keyManagement.components";

import {
  KeyPair,
  Mnemonic,
  MnemonicLength,
} from "@anoma-wallet/key-management";
// } from "../../../node_modules/@anoma-wallet/key-management";

import { useNavigate } from "react-router-dom";
import { Button } from "components/Button";
import { Icon, IconName } from "components/Icon";

// const mnemonic = new Mnemonic(MnemonicLength.TwentyFour);
// const keyPair = KeyPair.fromMnemonic(mnemonic);
// const publicKey = keyPair.getPublicKeyAsHex();
// const secretKey = keyPair.getSecretKeyAsHex();
function KeyManagement(): JSX.Element {
  const [publicKey, setPublicKey] = React.useState("");
  const [secretKey, setSecretKey] = React.useState("");
  React.useEffect(() => {
    const mnemonic = new Mnemonic(MnemonicLength.TwentyFour);
    const keyPair = KeyPair.fromMnemonic(mnemonic);

    setPublicKey(keyPair.getPublicKeyAsHex());
    setSecretKey(keyPair.getSecretKeyAsHex());
  }, []);
  const navigate = useNavigate();
  const themeContext = useContext(ThemeContext);
  const backButtonIconStrokeColor = themeContext.themeConfigurations.isLightMode
    ? themeContext.colors.border
    : "black";
  return (
    <MainSectionContainer>
      <TopSection>
        <Button
          onClick={() => {
            navigate("/");
          }}
          style={{ padding: "0" }}
        >
          <Icon
            iconName={IconName.ChevronLeft}
            strokeColorOverride={backButtonIconStrokeColor}
          />
        </Button>
      </TopSection>
      <HeadlineSectionContainer>
        <Headline>Key Management</Headline>
        <p>{publicKey}</p>
        <p>{secretKey}</p>
      </HeadlineSectionContainer>
    </MainSectionContainer>
  );
}

export default KeyManagement;
