import React from "react";
import { useContext } from "react";
import { ThemeContext } from "styled-components";
import {
  MainSectionContainer,
  TopSection,
  HeadlineSectionContainer,
  Headline,
} from "./keyManagement.components";

import { Mnemonic, MnemonicLength } from "@anoma-wallet/key-management";
import { useNavigate } from "react-router-dom";
import { Button } from "components/Button";
import { Icon, IconName } from "components/Icon";

function KeyManagement(): JSX.Element {
  const [publicKey, setPublicKey] = React.useState("");
  const [secretKey, setSecretKey] = React.useState("");
  const [mnemonic, setMnemonic] = React.useState("");
  React.useEffect(() => {
    const init = async (): Promise<void> => {
      const mnemonic = await Mnemonic.fromMnemonic(MnemonicLength.TwentyFour);
      setMnemonic(mnemonic.value);
    };
    init();

    // const mnemonic = new Mnemonic(MnemonicLength.TwentyFour);
    // const keyPair = KeyPair.fromMnemonic(mnemonic);
    // setPublicKey(keyPair.getPublicKeyAsHex());
    // setSecretKey(keyPair.getSecretKeyAsHex());
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
        <p>{mnemonic}</p>
      </HeadlineSectionContainer>
    </MainSectionContainer>
  );
}

export default KeyManagement;
