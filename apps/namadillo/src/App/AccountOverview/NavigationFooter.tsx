import { ActionButton, Heading, Stack } from "@namada/components";
import GovernanceRoutes from "App/Governance/routes";
import StakingRoutes from "App/Staking/routes";

export const NavigationFooter = (): JSX.Element => {
  return (
    <footer className="text-center">
      <Heading level="h3" className="uppercase text-4xl text-yellow mb-2">
        Stake & Vote Now
      </Heading>
      <Stack gap={3} direction="horizontal">
        <ActionButton
          className="border uppercase"
          href={StakingRoutes.overview().url}
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
          href={GovernanceRoutes.index()}
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
