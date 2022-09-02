import { useState } from "react";
import { MainContainerNavigation } from "App/StakingAndGovernance/MainContainerNavigation";
import { StakingContainer } from "./Staking.components";
import { Button, ButtonVariant } from "components/Button";

const initialTitle = "Staking";
export const Staking = (): JSX.Element => {
  const [breadcrumb, setBreadcrumb] = useState([initialTitle]);

  return (
    <StakingContainer>
      <MainContainerNavigation
        breadcrumbs={breadcrumb}
        navigateBack={() => setBreadcrumb([initialTitle])}
      />
      {breadcrumb.length === 1 && (
        <Button
          variant={ButtonVariant.Contained}
          onClick={() => {
            setBreadcrumb([initialTitle, "Polychain"]);
          }}
        >
          Navigate
        </Button>
      )}
    </StakingContainer>
  );
};
