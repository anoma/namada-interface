import React from "react";
import { useContext } from "react";
import { ThemeContext } from "styled-components";
import {
  MainSectionContainer,
  TopSection,
  TopSectionHeaderContainer,
  ContentContainer,
  TopSectionButtonContainer,
  Headline,
  BodyText,
  StyledTextArea,
} from "./keyManagement.components";

import {
  Mnemonic,
  MnemonicLength,
  KeyPair,
  KeyPairType,
} from "@anoma-wallet/key-management";
import { useNavigate } from "react-router-dom";
import { Button } from "components/Button";
import { Icon, IconName } from "components/Icon";

const LOCAL_STORAGE_STORAGE_VALUE_KEY = "localStorageStorageValue";

function KeyManagement(): JSX.Element {
  const [publicKey, setPublicKey] = React.useState("");
  const [secretKey, setSecretKey] = React.useState("");
  const [mnemonic, setMnemonic] = React.useState("");
  const [storageValue, setStorageValue] = React.useState("");
  React.useEffect(() => {
    const init = async (): Promise<void> => {
      let keyPair;
      const persistedStorageValue = localStorage.getItem(
        LOCAL_STORAGE_STORAGE_VALUE_KEY
      );
      if (persistedStorageValue) {
        const storageValue = KeyPair.storageValueStringToStorageValue(
          persistedStorageValue
        );
        if (storageValue?.keyPairType === KeyPairType.Encrypted) {
          const passwordToDecrypt =
            prompt("Please a password to decrypt the keys") || "";

          try {
            keyPair = await KeyPair.fromStorageValue(
              storageValue,
              KeyPairType.Encrypted,
              passwordToDecrypt
            );
          } catch {
            setStorageValue(storageValue.value);
            setPublicKey("You provided wrong password");
            setSecretKey("You provided wrong password");
            return;
          }
        } else if (storageValue) {
          keyPair = await KeyPair.fromStorageValue(
            storageValue,
            KeyPairType.Raw
          );
        } else {
          return;
        }
      } else {
        const mnemonic = await Mnemonic.fromMnemonic(MnemonicLength.TwentyFour);
        // we need a password to encrypt the value
        const passwordToEncrypt =
          prompt("Please enter a password to encrypt the keys") || "";
        keyPair = KeyPair.fromMnemonic(mnemonic, passwordToEncrypt);
        setMnemonic(mnemonic.value);
      }

      const keyPairStorageString = keyPair.getStorageValue();

      localStorage.setItem(
        LOCAL_STORAGE_STORAGE_VALUE_KEY,
        keyPairStorageString.value
      );

      // setMnemonic(mnemonic.value);
      setStorageValue(keyPairStorageString.value);
      if (keyPair) {
        setPublicKey(keyPair.getPublicKeyAsHex());
        setSecretKey(keyPair.getSecretKeyAsHex());
      } else {
        setPublicKey("could not encrypt");
        setSecretKey("could not encrypt");
      }
    };
    init();
  }, []);
  const navigate = useNavigate();
  const themeContext = useContext(ThemeContext);
  const backButtonIconStrokeColor = themeContext.themeConfigurations.isLightMode
    ? themeContext.colors.border
    : "black";
  return (
    <MainSectionContainer>
      <TopSection>
        <TopSectionButtonContainer>
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
        </TopSectionButtonContainer>
        <TopSectionHeaderContainer>
          <Headline>Key Management</Headline>
        </TopSectionHeaderContainer>
        <TopSectionButtonContainer />
      </TopSection>
      <ContentContainer style={{ overflowY: "scroll" }}>
        <BodyText style={{ overflowWrap: "anywhere", fontWeight: "700" }}>
          Seed phrase
        </BodyText>
        <StyledTextArea defaultValue={mnemonic} rows={8} />
        <BodyText style={{ overflowWrap: "anywhere", fontWeight: "700" }}>
          Storage value
        </BodyText>
        <BodyText style={{ overflowWrap: "anywhere" }}>{storageValue}</BodyText>
        <div>
          <Button
            onClick={() => {
              localStorage.removeItem(LOCAL_STORAGE_STORAGE_VALUE_KEY);
              location.reload();
            }}
          >
            Delete storage value
          </Button>
        </div>
        <BodyText style={{ overflowWrap: "anywhere", fontWeight: "700" }}>
          Public key
        </BodyText>
        <BodyText
          style={{
            overflowWrap: "anywhere",
            color:
              publicKey === "You provided wrong password" ? "red" : "green",
          }}
        >
          {publicKey}
        </BodyText>
        <BodyText style={{ overflowWrap: "anywhere", fontWeight: "700" }}>
          Secret key
        </BodyText>
        <BodyText
          style={{
            overflowWrap: "anywhere",
            color:
              publicKey === "You provided wrong password" ? "red" : "green",
          }}
        >
          {secretKey}
        </BodyText>
      </ContentContainer>
    </MainSectionContainer>
  );
}

export default KeyManagement;
