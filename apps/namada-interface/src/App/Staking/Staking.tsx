import { useSanitizedLocation } from "@namada/hooks";
import { useAtomValue } from "jotai";
import { loadable } from "jotai/utils";
import { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import {
  ChangeInStakingPosition,
  fetchValidatorDetails,
  postNewBonding,
  postNewUnbonding,
} from "slices/StakingAndGovernance";
import { isRevealPkNeededAtom, minimumGasPriceAtom } from "slices/fees";
import { useAppDispatch } from "store";
import IncrementBonding from "./IncrementBonding";
import ReDelegate from "./ReDelegate";
import { StakingOverview } from "./StakingOverview";
import Unstake from "./Unstake";
import StakingRoutes from "./routes";

//  This is the parent view for all staking related views. Most of the
//  staking specific functions are defined here and passed down as props.
//  This contains the main vies in staking:
//  * StakingOverview - displaying an overview of the users staking and validators
//  * ValidatorDetails - as the name says
//  * NewStakingStakingPosition - rendered in modal on top of other content
//     this is for creating new staking positions
//  * UnstakePositions - rendered in modal on top of other content, for unstaking
export const Staking = (): JSX.Element => {
  const location = useSanitizedLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const minimumGasPrice = useAtomValue(loadable(minimumGasPriceAtom));
  const isRevealPkNeeded = useAtomValue(loadable(isRevealPkNeededAtom));

  const loadablesReady =
    minimumGasPrice.state === "hasData" && isRevealPkNeeded.state === "hasData";

  // from outside this view we just navigate here
  // this view decides what is the default view
  useEffect(() => {
    if (location.pathname === StakingRoutes.index()) {
      navigate(StakingRoutes.overview().url);
    }
  }, [location.pathname]);

  const navigateToValidatorDetails = (validatorId: string): void => {
    dispatch(fetchValidatorDetails(validatorId));
  };

  // callbacks for the bonding and unbonding views
  const confirmBonding = (
    changeInStakingPosition: ChangeInStakingPosition
  ): void => {
    dispatch(postNewBonding(changeInStakingPosition));
  };

  const confirmUnbonding = (
    changeInStakingPosition: ChangeInStakingPosition
  ): void => {
    postNewUnbonding(changeInStakingPosition);
  };

  return (
    <main className="w-full">
      <Routes>
        <Route path="/*" element={<StakingOverview />} />
      </Routes>
      <Routes>
        <Route
          path={`${StakingRoutes.incrementBonding()}`}
          element={<IncrementBonding />}
        />
        <Route path={`${StakingRoutes.unstake()}`} element={<Unstake />} />
        <Route
          path={`${StakingRoutes.redelegateBonding()}`}
          element={<ReDelegate />}
        />
      </Routes>
    </main>
  );
};
