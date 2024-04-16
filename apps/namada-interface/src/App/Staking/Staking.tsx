import BigNumber from "bignumber.js";
import { useAtomValue, useSetAtom } from "jotai";
import { loadable } from "jotai/utils";
import { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";

import { useSanitizedLocation } from "@namada/hooks";

import { StakingAndGovernanceSubRoute } from "App/types";
import {
  ChangeInStakingPosition,
  StakingPosition,
  fetchValidatorDetails,
  postNewBonding,
  postNewUnbonding,
} from "slices/StakingAndGovernance";
import { AccountsState } from "slices/accounts";
import { isRevealPkNeededAtom, minimumGasPriceAtom } from "slices/fees";
import { StakingOverview } from "./StakingOverview";

import { Chain } from "@namada/types";
import { fetchMyValidatorsAtom } from "slices/validators";
import { RootState, useAppDispatch, useAppSelector } from "store";
import { Bonding } from "./Bonding";
import StakingRoutes from "./routes";

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

const emptyStakingPosition = (validatorId: string): StakingPosition => ({
  uuid: validatorId,
  bonded: true,
  stakedAmount: new BigNumber(0),
  owner: "",
  totalRewards: "",
  validatorId: validatorId,
});

// in this view we can be in one of these states at any given time
export enum ModalState {
  None,
  NewBonding,
  Unbond,
}

// TODO: these should go to Modal component
export enum ModalOnRequestCloseType {
  Confirm,
  Cancel,
}

//  This is the parent view for all staking related views. Most of the
//  staking specific functions are defined here and passed down as props.
//  This contains the main vies in staking:
//  * StakingOverview - displaying an overview of the users staking and validators
//  * ValidatorDetails - as the name says
//  * NewStakingStakingPosition - rendered in modal on top of other content
//     this is for creating new staking positions
//  * UnstakePositions - rendered in modal on top of other content, for unstaking
export const Staking = (): JSX.Element => {
  const [modalState, setModalState] = useState(ModalState.None);
  const location = useSanitizedLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const minimumGasPrice = useAtomValue(loadable(minimumGasPriceAtom));
  const isRevealPkNeeded = useAtomValue(loadable(isRevealPkNeededAtom));
  const fetchMyValidators = useSetAtom(fetchMyValidatorsAtom);

  const loadablesReady =
    minimumGasPrice.state === "hasData" && isRevealPkNeeded.state === "hasData";
  const chain = useAppSelector<Chain>((state: RootState) => state.chain.config);

  const derivedAccounts = useAppSelector<AccountsState>(
    (state: RootState) => state.accounts
  ).derived[chain.id];

  const accounts = Object.values(derivedAccounts);

  const stakingAndGovernance = useAppSelector(
    (state: RootState) => state.stakingAndGovernance
  );

  const { validators, selectedValidatorId, myStakingPositions } =
    stakingAndGovernance;

  // these 2 are needed for validator details
  const stakingPositionsWithSelectedValidator = myStakingPositions.filter(
    (validator) => validator.validatorId === selectedValidatorId
  );

  const selectedValidator = validators.find(
    (validator) => validator.uuid === selectedValidatorId
  );

  const currentBondingPositions =
    stakingPositionsWithSelectedValidator.length !== 0 ?
      stakingPositionsWithSelectedValidator
    : [emptyStakingPosition(selectedValidatorId || "")];

  // from outside this view we just navigate here
  // this view decides what is the default view
  useEffect(() => {
    if (location.pathname === StakingRoutes.index()) {
      navigate(StakingRoutes.overview().url);
    }
  }, [location.pathname]);

  const navigateToValidatorDetails = (validatorId: string): void => {
    navigate(StakingRoutes.validatorDetails(validatorId));
    dispatch(fetchValidatorDetails(validatorId));
  };

  const navigateToUnbonding = (validatorId: string, owner: string): void => {
    navigate(StakingRoutes.validatorDetailsOwner(validatorId, owner));
  };

  // callbacks for the bonding and unbonding views
  const confirmBonding = (
    changeInStakingPosition: ChangeInStakingPosition
  ): void => {
    setModalState(ModalState.None);
    dispatch(postNewBonding(changeInStakingPosition));
  };

  const cancelBonding = (): void => {
    setModalState(ModalState.None);
  };

  const confirmUnbonding = (
    changeInStakingPosition: ChangeInStakingPosition
  ): void => {
    setModalState(ModalState.None);
    postNewUnbonding(changeInStakingPosition);
  };

  const cancelUnbonding = (): void => {
    setModalState(ModalState.None);
    navigateToValidatorDetails(selectedValidatorId || "");
  };

  return (
    <main className="w-full">
      <Routes>
        <Route
          path={`${StakingRoutes.overview()}`}
          element={<StakingOverview />}
        />
        <Route path={`${StakingRoutes.bond()}`} element={<Bonding />} />
      </Routes>
    </main>
  );
};
