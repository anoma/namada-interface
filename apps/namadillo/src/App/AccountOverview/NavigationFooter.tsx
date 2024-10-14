import { ActionButton, Heading, Stack } from "@namada/components";
import { routes } from "App/routes";

export const NavigationFooter = (): JSX.Element => {
  return (
    <footer className="text-center">
      <Heading level="h3" className="uppercase text-4xl text-yellow mb-2">
        Stake & Vote Now
      </Heading>
      <Stack gap={3} direction="horizontal" className="justify-center">
        <ActionButton
          className="border uppercase"
          href={routes.staking}
          size="sm"
          backgroundColor="cyan"
          outlineColor="cyan"
          textColor="black"
          textHoverColor="cyan"
          backgroundHoverColor="transparent"
        >
          Stake
        </ActionButton>
        <ActionButton
          size="sm"
          href={routes.governance}
          outlineColor="yellow"
          className="uppercase"
          backgroundColor="transparent"
          textColor="yellow"
          backgroundHoverColor="yellow"
        >
          Governance
        </ActionButton>
      </Stack>
    </footer>
  );
};
