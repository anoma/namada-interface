import { useEffect } from "react";
import { useAppDispatch, useAppSelector, RootState } from "store";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

import { Staking } from "App/Staking";
import { Governance } from "App/Governance";
import { PublicGoodsFunding } from "App/PublicGoodsFunding";
import { StakingAndGovernanceContainer } from "./StakingAndGovernance.components";
import {
  TopLevelRoute,
  StakingAndGovernanceSubRoute,
  locationToStakingAndGovernanceSubRoute,
} from "App/types";

import {
  fetchMyBalances,
  fetchValidators,
  fetchValidatorDetails,
} from "slices/StakingAndGovernance";

// This is just rendering the actual Staking/Governance/PGF screens
// mostly the purpose of this is to define the default behavior when
// the user clicks the top level Staking & Governance menu
export const StakingAndGovernance = (): JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const stakingAndGovernance = useAppSelector(
    (state: RootState) => state.stakingAndGovernance
  );
  const { myBalances, validators, myValidators, selectedValidatorId } =
    stakingAndGovernance;

  const selectedValidator = validators.find(
    (validator) => validator.uuid === selectedValidatorId
  );

  // we need one of the sub routes, staking alone has nothing
  const stakingAndGovernanceSubRoute =
    locationToStakingAndGovernanceSubRoute(location);

  // from outside this view we just navigate here
  // this view decides what is the default view
  useEffect(() => {
    if (!!!stakingAndGovernanceSubRoute) {
      navigate(
        `${TopLevelRoute.StakingAndGovernance}${StakingAndGovernanceSubRoute.Staking}${StakingAndGovernanceSubRoute.StakingOverview}`
      );
    }
  });

  // triggered by the initial load of <Staking />
  const fetchValidatorsCallback = (): void => {
    dispatch(fetchValidators());
  };

  const fetchMyBalancesCallback = (): void => {
    dispatch(fetchMyBalances());
  };

  // triggered by the url load or user click in <Staking />
  const fetchValidatorDetailsCallback = (validatorId: string): void => {
    dispatch(fetchValidatorDetails(validatorId));
  };

  return (
    <StakingAndGovernanceContainer>
      <Routes>
        <Route
          path={`${StakingAndGovernanceSubRoute.Staking}/*`}
          element={
            <Staking
              myBalances={myBalances}
              validators={validators}
              myValidators={myValidators}
              selectedValidator={selectedValidator}
              fetchMyBalances={fetchMyBalancesCallback}
              fetchValidators={fetchValidatorsCallback}
              fetchValidatorDetails={fetchValidatorDetailsCallback}
            />
          }
        />
        <Route
          path={StakingAndGovernanceSubRoute.Governance}
          element={<Governance />}
        />
        <Route
          path={StakingAndGovernanceSubRoute.PublicGoodsFunding}
          element={<PublicGoodsFunding />}
        />
      </Routes>
    </StakingAndGovernanceContainer>
  );
};
