import { ActionButton, Heading, Stack } from "@namada/components";
import { CheckedIcon } from "App/Icons/CheckedIcon";
import { WalletAddress } from "../WalletAddress";
import {
  IconContainer,
  Panel,
  WalletOrAddressContainer,
  YouAreEligibleContainer,
  YouAreEligibleMessage,
} from "./YouAreEligible.component";

type YouAreEligibleType = {
  title: string;
  accountOrWallet: string;
  onClaim: () => void;
};

export const YouAreEligible = ({
  title,
  accountOrWallet,
  onClaim,
}: YouAreEligibleType): JSX.Element => {
  return (
    <YouAreEligibleContainer>
      <YouAreEligibleMessage>
        <IconContainer>
          <CheckedIcon />
        </IconContainer>
        <Heading size="4xl" level="h1" themeColor="utility1">
          You are Eligible
        </Heading>
        <p>Congrats you are eligible for the Namada RPGF Drop!</p>
      </YouAreEligibleMessage>
      <Panel>
        <WalletOrAddressContainer>
          <Stack gap={1}>
            <span>{title}:</span>
            <WalletAddress>{accountOrWallet}</WalletAddress>
          </Stack>
          <ActionButton
            onClick={onClaim}
            variant="secondary"
            hoverColor="primary"
          >
            Proceed to Claim
          </ActionButton>
        </WalletOrAddressContainer>
      </Panel>
    </YouAreEligibleContainer>
  );
};
