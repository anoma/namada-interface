import { Button, ButtonVariant } from "components/Button";
import {
  StartViewContainer,
  StartViewUpperPartContainer,
  Header1,
  BodyText,
} from "./Start.components";
type StartViewProps = {
  onCtaClick: () => void;
  // read in parent why we do this
  onCtaHover: () => void;
};

function Start(props: StartViewProps): React.ReactElement {
  const { onCtaClick, onCtaHover } = props;
  return (
    <StartViewContainer>
      <StartViewUpperPartContainer>
        <Header1>Create a new account</Header1>
        <BodyText>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Enim augue
          aenean facilisi placerat laoreet sem faucibus curabitur. Posuere ut
          porttitor eu auctor eu. Aenean faucibus non eleifend neque ullamcorper
          viverra amet.
        </BodyText>
      </StartViewUpperPartContainer>
      <Button onClick={onCtaClick} variant={ButtonVariant.Contained}>
        Create an account
      </Button>
      <Button
        onClick={() => null}
        disabled={true}
        variant={ButtonVariant.Contained}
      >
        Import an account
      </Button>
      <Button
        onClick={() => null}
        disabled={true}
        variant={ButtonVariant.Contained}
      >
        Connect to Ledger
      </Button>
    </StartViewContainer>
  );
}

export default Start;
