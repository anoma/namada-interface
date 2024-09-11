import { minimumGasPriceAtom } from "atoms/fees";
import { useAtomValue } from "jotai";
import { Route, Routes, useLocation } from "react-router-dom";
import IncrementBonding from "./IncrementBonding";
import { ReDelegate } from "./ReDelegate";
import { StakingOverview } from "./StakingOverview";
import Unstake from "./Unstake";
import StakingRoutes from "./routes";

export const Staking = (): JSX.Element => {
  const location = useLocation();
  useAtomValue(minimumGasPriceAtom);

  return (
    <main className="w-full">
      <Routes>
        <Route path="/*" element={<StakingOverview />} />
      </Routes>
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
    </main>
  );
};
