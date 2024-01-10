import { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { RootState, useAppDispatch, useAppSelector } from "store";

import { useSanitizedLocation } from "@namada/hooks";
import { useIntegrationConnection } from "@namada/integrations";
import { Staking } from "App/Staking";
import {
  StakingAndGovernanceSubRoute,
  TopLevelRoute,
  locationToStakingAndGovernanceSubRoute,
} from "App/types";
import { StakingAndGovernanceContainer } from "./StakingAndGovernance.components";

import { Chain } from "@namada/types";
import {
  ChangeInStakingPosition,
  fetchValidatorDetails,
  fetchValidators,
  postNewBonding as postNewBondingAction,
  postNewUnbonding as postNewUnbondingAction,
} from "slices/StakingAndGovernance";
import { AccountsState } from "slices/accounts";

export type { ChangeInStakingPosition };
// This is just rendering the actual Staking/Governance/PGF screens
// mostly the purpose of this is to define the default behavior when
// the user clicks the top level Staking & Governance menu
//
export const StakingAndGovernance = (): JSX.Element => {
  const location = useSanitizedLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const chain = useAppSelector<Chain>((state: RootState) => state.chain.config);
  const { id } = chain;
  const stakingAndGovernance = useAppSelector(
    (state: RootState) => state.stakingAndGovernance
  );
  const derivedAccounts = useAppSelector<AccountsState>(
    (state: RootState) => state.accounts
  ).derived[id];

  const accounts = Object.values(derivedAccounts);
  const [_integration, _status, withConnection] = useIntegrationConnection(id);

  const { validators, selectedValidatorId, myStakingPositions } =
    stakingAndGovernance;

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
  const onStakingComponentInitCallback = (): void => {
    dispatch(fetchValidators());
  };

  // triggered by the url load or user click in <Staking />
  const fetchValidatorDetailsCallback = (validatorId: string): void => {
    dispatch(fetchValidatorDetails(validatorId));
  };

  const postNewBonding = (
    changeInStakingPosition: ChangeInStakingPosition
  ): void => {
    withConnection(() => {
      dispatch(postNewBondingAction(changeInStakingPosition));
    });
  };

  const postNewUnbonding = (
    changeInStakingPosition: ChangeInStakingPosition
  ): void => {
    withConnection(() => {
      dispatch(postNewUnbondingAction(changeInStakingPosition));
    });
  };

  return (
    <StakingAndGovernanceContainer>
      <Routes>
        <Route
          path={`${StakingAndGovernanceSubRoute.Staking}/*`}
          element={
            <Staking
              accounts={accounts}
              validators={validators}
              myStakingPositions={myStakingPositions}
              selectedValidatorId={selectedValidatorId}
              onInitCallback={onStakingComponentInitCallback}
              fetchValidatorDetails={fetchValidatorDetailsCallback}
              postNewBonding={postNewBonding}
              postNewUnbonding={postNewUnbonding}
            />
          }
        />
      </Routes>
    </StakingAndGovernanceContainer>
  );
};
