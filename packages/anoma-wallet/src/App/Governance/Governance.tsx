import { useState } from "react";
import { MainContainerNavigation } from "App/StakingAndGovernance/MainContainerNavigation";
import { GovernanceContainer } from "./Governance.components";
import { Button, ButtonVariant } from "components/Button";

const initialTitle = "Governance";
export const Governance = (): JSX.Element => {
  const [breadcrumb, setBreadcrumb] = useState([initialTitle]);

  return (
    <GovernanceContainer>
      <MainContainerNavigation
        breadcrumbs={breadcrumb}
        navigateBack={() => setBreadcrumb([initialTitle])}
      />

      {breadcrumb.length === 1 && (
        <Button
          variant={ButtonVariant.Contained}
          onClick={() => {
            setBreadcrumb([initialTitle, "Proposal #123"]);
          }}
        >
          Navigate
        </Button>
      )}
    </GovernanceContainer>
  );
};
