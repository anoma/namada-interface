import { Button } from "components/ButtonTemporary";
import {
  StartViewContainer,
  StartViewUpperPartContainer,
  Header1,
  BodyText,
} from "./Start.components";
type StartViewProps = {
  onCtaClick: () => void;
  onCtaHover: () => void;
};

function Start(props: StartViewProps): JSX.Element {
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
      <Button onClick={onCtaClick} onHover={onCtaHover}>
        Create an Account
      </Button>
    </StartViewContainer>
  );
}

export default Start;
