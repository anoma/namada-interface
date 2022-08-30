import { NavigationContainer } from "components/NavigationContainer";
import { Heading, HeadingLevel } from "components/Heading";
import { StakingAndGovernanceContainer } from "./StakingAndGovernance.components";

export const StakingAndGovernance = (): JSX.Element => {
  return (
    <StakingAndGovernanceContainer>
      <NavigationContainer>
        <Heading level={HeadingLevel.One}>Staking & Governance</Heading>
      </NavigationContainer>
      <a
        href="https://github.com/anoma/spec/blob/master/src/architecture/namada/web-wallet/user-interfaces.md#stakingandgovernance-1"
        target="_blank"
        rel="noopener noreferrer"
      >
        StakingAndGovernance
      </a>
    </StakingAndGovernanceContainer>
  );
};
