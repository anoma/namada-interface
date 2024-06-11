import { ActionButton, Heading, Stack } from "@namada/components";
import GovernanceRoutes from "App/Governance/routes";
import StakingRoutes from "App/Staking/routes";
import { useNavigate } from "react-router-dom";

export const NavigationFooter = (): JSX.Element => {
  const navigate = useNavigate();
  return (
    <footer className="text-center">
      <Heading level="h3" className="uppercase text-4xl text-yellow mb-2">
        Stake & Vote Now
      </Heading>
      <Stack gap={3} direction="horizontal">
        <ActionButton
          className="border uppercase"
          onClick={() => navigate(StakingRoutes.overview().url)}
          size="sm"
          color="secondary"
          borderRadius="sm"
        >
          Stake
        </ActionButton>
        <ActionButton
          size="sm"
          onClick={() => navigate(GovernanceRoutes.index())}
          color="primary"
          outlined
          className="uppercase hover:text-rblack before:border before:border-yellow"
          borderRadius="sm"
          hoverColor="primary"
        >
          Governance
        </ActionButton>
      </Stack>
    </footer>
  );
};
