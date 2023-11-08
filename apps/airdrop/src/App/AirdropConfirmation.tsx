import {
  Button,
  ButtonVariant,
  Heading,
  HeadingLevel,
} from "@namada/components";
import { useAtom } from "jotai";
import { confirmationAtom } from "./state";
import {
  AirdropConfirmationContainer,
  AirdropConfirmationHeader,
  AirdropConfirmationSection,
} from "./App.components";
import { useNavigate } from "react-router-dom";

export const AirdropConfirmation: React.FC = () => {
  const [confirmation, setConfirmation] = useAtom(confirmationAtom);

  const navigate = useNavigate();
  return (
    <AirdropConfirmationContainer>
      <AirdropConfirmationHeader>
        <Button
          variant={ButtonVariant.Small}
          onClick={() => {
            navigate("/");
          }}
        >
          Start over
        </Button>
      </AirdropConfirmationHeader>
      <AirdropConfirmationSection>
        <Heading level={HeadingLevel.One}>
          Namada Genesis
          <br />
          Account Submitted
        </Heading>
        <p>
          NAM will be available diretly in your wallet at Namada Mainnet launch,
          <br />
          subject to the Terms of Service.
        </p>
        <p>
          <b>Genesis Account:</b>
        </p>
        <p>{confirmation.address}</p>
        <Heading level={HeadingLevel.Four}>Minimum NAM:</Heading>
        <Heading level={HeadingLevel.One}>{confirmation.amount}</Heading>
      </AirdropConfirmationSection>
    </AirdropConfirmationContainer>
  );
};
