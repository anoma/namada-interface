import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { MainContainerNavigation } from "App/StakingAndGovernance/MainContainerNavigation";
import { StakingContainer } from "./Staking.components";
import { StakingOverview } from "./StakingOverview";
import { ValidatorDetails } from "./ValidatorDetails";
import { TopLevelRoute, StakingAndGovernanceSubRoute } from "App/types";
import {
  MyBalanceEntry,
  Validator,
  MyValidators,
} from "slices/StakingAndGovernance";

const initialTitle = "Staking";

// this is just a placeholder in real case we can use the
// navigation callback that we define in this file and pass
// down for the table
const breadcrumbsFromPath = (path: string): string[] => {
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

const validatorNameFromUrl = (path: string): string | undefined => {
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
  myBalances: MyBalanceEntry[];
  validators: Validator[];
  myValidators: MyValidators[];
  selectedValidator: string | undefined;
  fetchMyBalances: () => void;
  fetchValidators: () => void;
  fetchValidatorDetails: (validatorId: string) => void;
};

export const Staking = (props: Props): JSX.Element => {
  const [breadcrumb, setBreadcrumb] = useState([initialTitle]);
  const [validatorName, setValidatorName] = useState<string | undefined>();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    fetchMyBalances,
    fetchValidators,
    fetchValidatorDetails,
    myBalances,
    validators,
    myValidators,
  } = props;

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
    fetchMyBalances();
    fetchValidators();
  }, []);

  useEffect(() => {
    const newBreadcrumb = breadcrumbsFromPath(location.pathname);
    const validatorName = validatorNameFromUrl(location.pathname);
    if (validatorName) {
      // triggers fetching of further details
      // fetchValidatorDetails(validatorName);

      // placeholders
      setBreadcrumb(newBreadcrumb);
      setValidatorName(validatorName);
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
              myBalances={myBalances}
              myValidators={myValidators}
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
