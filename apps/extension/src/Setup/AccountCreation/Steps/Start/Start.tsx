import { Button, ButtonVariant } from "@anoma/components";
import {
  StartViewContainer,
  StartViewUpperPartContainer,
  Header1,
  BodyText,
} from "./Start.components";
type StartViewProps = {
  onClick: () => void;
};

const Start = (props: StartViewProps): JSX.Element => {
  const { onClick } = props;
  return (
    <StartViewContainer>
      <StartViewUpperPartContainer>
        <Header1>Create Your Account</Header1>
        <BodyText>Create an initial account for your wallet.</BodyText>
      </StartViewUpperPartContainer>
      <Button onClick={onClick} variant={ButtonVariant.Contained}>
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
};

export default Start;
