import { useContext, useEffect } from "react";
import { AppContext } from "App/App";
import { Button, Variant } from "components/ButtonTemporary";
import { Image, ImageName } from "components/Image";
import { Session } from "lib";

import {
  StartViewContainer,
  StartViewUpperPartContainer,
  ImageContainer,
  Header1,
  BodyText,
  ButtonsContainer,
  ButtonContainer,
} from "./Completion.components";

type StartViewProps = {
  isInitializing: boolean;
  // navigates to the account
  onClickSeeAccounts: () => void;
  // navigates to the settings
  onClickDone: () => void;
};

const Completion = (props: StartViewProps): JSX.Element => {
  const { isInitializing, onClickDone, onClickSeeAccounts } = props;
  const context = useContext(AppContext) || {};
  const { password = "" } = context;

  useEffect(() => {
    // Log the user in:
    new Session().setSession(password);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StartViewContainer>
      {isInitializing ? (
        <div>
          <p>Account is being initialized on ledger...</p>
        </div>
      ) : (
        <>
          <StartViewUpperPartContainer>
            <ImageContainer>
              <Image imageName={ImageName.SuccessImage} />
            </ImageContainer>

            <Header1>You are all set!</Header1>
            <BodyText>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla
              maecenas sed bibendum sed velit. Consequat bibendum nibh netus sed
              erat sed.
            </BodyText>
          </StartViewUpperPartContainer>
          <ButtonsContainer>
            <ButtonContainer>
              <Button
                onClick={onClickDone}
                style={{ width: "100%" }}
                variant={Variant.outline}
              >
                Done
              </Button>
            </ButtonContainer>
            <ButtonContainer>
              <Button onClick={onClickSeeAccounts}>See Account</Button>
            </ButtonContainer>
          </ButtonsContainer>
        </>
      )}
    </StartViewContainer>
  );
};

export default Completion;
