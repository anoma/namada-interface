import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { MainContainerNavigation } from "App/StakingAndGovernance/MainContainerNavigation";
import { StakingContainer } from "./Staking.components";
import { StakingOverview } from "./StakingOverview";
import { ValidatorDetails } from "./ValidatorDetails";
import { TopLevelRoute, StakingAndGovernanceSubRoute } from "App/types";
import { Validator } from "slices/StakingAndGovernance";

const initialTitle = "Staking";

// this is just a placeholder in real case we can use the
// navigation callback that we define in this file and pass
// down for the table
const figureOutBreadcrumb = (path: string): string[] => {
  const pathInParts = path.split("/");
  const pathLength = pathInParts.length;

  if (
    `/${pathInParts[pathLength - 2]}` ===
    StakingAndGovernanceSubRoute.ValidatorDetails
  ) {
    return ["Staking", pathInParts[pathLength - 1]];
  }
  return ["Staking"];
};

const figureOutValidatorFromUrl = (path: string): string | undefined => {
  const pathInParts = path.split("/");
  const pathLength = pathInParts.length;

  if (
    `/${pathInParts[pathLength - 2]}` ===
    StakingAndGovernanceSubRoute.ValidatorDetails
  ) {
    return pathInParts[pathLength - 1];
  }
};

type Props = {
  validators: Validator[];
  selectedValidator: string | undefined;
  fetchValidators: () => void;
  fetchValidatorDetails: (validatorId: string) => void;
};

export const Staking = (props: Props): JSX.Element => {
  const [breadcrumb, setBreadcrumb] = useState([initialTitle]);
  const [validatorName, setValidatorName] = useState<string | undefined>();
  const location = useLocation();
  const navigate = useNavigate();

  const { fetchValidators, fetchValidatorDetails, validators } = props;

  // this is just so we can se the title/breadcrumb
  // in real case we do this cleanly in a callback that
  // we define here
  const isStakingRoot =
    location.pathname ===
    `${TopLevelRoute.StakingAndGovernance}${StakingAndGovernanceSubRoute.Staking}`;

  // from outside this view we just navigate here
  // this view decides what is the default view
  useEffect(() => {
    if (isStakingRoot) {
      navigate(
        `${TopLevelRoute.StakingAndGovernance}${StakingAndGovernanceSubRoute.Staking}${StakingAndGovernanceSubRoute.StakingOverview}`
      );
    }
  });

  useEffect(() => {
    fetchValidators();
  }, []);

  useEffect(() => {
    const newBreadcrumb = figureOutBreadcrumb(location.pathname);
    const validatorNameFromUrl = figureOutValidatorFromUrl(location.pathname);
    if (validatorNameFromUrl) {
      // triggers fetching of further details
      // fetchValidatorDetails(validatorNameFromUrl);

      // placeholders
      setBreadcrumb(newBreadcrumb);
      setValidatorName(validatorNameFromUrl);
    }
  }, [location, JSON.stringify(breadcrumb)]);

  const navigateToValidatorDetails = (validatorId: string): void => {
    navigate(
      `${TopLevelRoute.StakingAndGovernance}${StakingAndGovernanceSubRoute.Staking}${StakingAndGovernanceSubRoute.ValidatorDetails}/${validatorId}`
    );
    fetchValidatorDetails(validatorId);
  };

  return (
    <StakingContainer>
      <MainContainerNavigation
        breadcrumbs={breadcrumb}
        navigateBack={() => {
          navigate(
            `${TopLevelRoute.StakingAndGovernance}${StakingAndGovernanceSubRoute.Staking}${StakingAndGovernanceSubRoute.StakingOverview}`
          );
          setBreadcrumb([initialTitle]);
        }}
      />
      <Routes>
        <Route
          path={StakingAndGovernanceSubRoute.StakingOverview}
          element={
            <StakingOverview
              navigateToValidatorDetails={navigateToValidatorDetails}
              ownValidators={[]}
              validators={validators}
            />
          }
        />
        <Route
          path={`${StakingAndGovernanceSubRoute.ValidatorDetails}/*`}
          element={<ValidatorDetails validator={validatorName} />}
        />
      </Routes>
    </StakingContainer>
  );
};
