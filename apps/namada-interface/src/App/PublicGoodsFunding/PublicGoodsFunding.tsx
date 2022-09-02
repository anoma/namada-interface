import { useState } from "react";
import { MainContainerNavigation } from "App/StakingAndGovernance/MainContainerNavigation";
import { PublicGoodsFundingContainer } from "./PublicGoodsFunding.components";
import { Button, ButtonVariant } from "components/Button";

const initialTitle = "Public Goods Funding";

export const PublicGoodsFunding = (): JSX.Element => {
  const [breadcrumb, setBreadcrumb] = useState([initialTitle]);

  return (
    <PublicGoodsFundingContainer>
      <MainContainerNavigation
        breadcrumbs={breadcrumb}
        navigateBack={() => setBreadcrumb([initialTitle])}
      />
      {breadcrumb.length === 1 && (
        <Button
          variant={ButtonVariant.Contained}
          onClick={() => {
            setBreadcrumb([initialTitle, "Continuous Funding"]);
          }}
        >
          Navigate
        </Button>
      )}
    </PublicGoodsFundingContainer>
  );
};
