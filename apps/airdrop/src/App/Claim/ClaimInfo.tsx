import { useNavigate } from "react-router-dom";
import { Button, ButtonVariant, Heading } from "@namada/components";
import { EligibilitySection } from "App/App.components";

export const ClaimInfo: React.FC = () => {
  const navigate = useNavigate();

  return (
    <EligibilitySection>
      <span>
        <Heading level={"h1"}>You are eligible</Heading>
        <p>Congrats, you are eligible for the Namada RPGF Drop!</p>
      </span>
      <Button
        variant={ButtonVariant.Contained}
        onClick={() => {
          navigate("/claim/confirmation");
        }}
      >
        Claim NAM
      </Button>
    </EligibilitySection>
  );
};
