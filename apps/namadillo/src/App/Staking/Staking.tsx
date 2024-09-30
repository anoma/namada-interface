import { NotFound } from "App/Common/NotFound";
import { Route, Routes } from "react-router-dom";
import IncrementBonding from "./IncrementBonding";
import { ReDelegate } from "./ReDelegate";
import { StakingOverview } from "./StakingOverview";
import Unstake from "./Unstake";
import { StakingRoutes } from "./routes";

export const Staking = (): JSX.Element => {
  return (
    <Routes>
      <Route
        path={`${StakingRoutes.overview()}`}
        element={<StakingOverview />}
      />
      <Route
        path={`${StakingRoutes.incrementBonding()}`}
        element={<IncrementBonding />}
      />
      <Route path={`${StakingRoutes.unstake()}`} element={<Unstake />} />
      <Route
        path={`${StakingRoutes.redelegateBonding()}`}
        element={<ReDelegate />}
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
