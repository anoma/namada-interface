import { Heading } from "@namada/components";
import { useAtom } from "jotai";
import { confirmationAtom } from "./state";
import {
  AirdropConfirmationContainer,
  AirdropConfirmationHeader,
  AirdropConfirmationSection,
} from "./App.components";

export const AirdropConfirmation: React.FC = () => {
  const [confirmation] = useAtom(confirmationAtom);

  return (
    <AirdropConfirmationContainer>
      <AirdropConfirmationHeader></AirdropConfirmationHeader>
      <AirdropConfirmationSection>
        <Heading level={"h1"}>
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
        <Heading level={"h4"}>Minimum NAM:</Heading>
        <Heading level={"h1"}>{confirmation.amount}</Heading>
      </AirdropConfirmationSection>
    </AirdropConfirmationContainer>
  );
};
