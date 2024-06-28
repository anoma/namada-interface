import { minimumGasPriceAtom } from "atoms/fees";
import { AnimatePresence } from "framer-motion";
import { useAtomValue } from "jotai";
import { Route, Routes, useLocation } from "react-router-dom";
import IncrementBonding from "./IncrementBonding";
import { ReDelegate } from "./ReDelegate";
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
  const location = useLocation();
  useAtomValue(minimumGasPriceAtom);

  return (
    <main className="w-full">
      <Routes>
        <Route path="/*" element={<StakingOverview />} />
      </Routes>
      <AnimatePresence>
        <Routes location={location} key={location.pathname}>
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
      </AnimatePresence>
    </main>
  );
};
