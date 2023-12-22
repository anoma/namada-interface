import { ActionButton } from "@namada/components";
import { MainContainerNavigation } from "App/StakingAndGovernance/MainContainerNavigation";
import { useState } from "react";
import { PublicGoodsFundingContainer } from "./PublicGoodsFunding.components";

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
        <ActionButton
          onClick={() => {
            setBreadcrumb([initialTitle, "Continuous Funding"]);
          }}
        >
          Navigate
        </ActionButton>
      )}
    </PublicGoodsFundingContainer>
  );
};
