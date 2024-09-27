import { Route, Routes } from "react-router-dom";
import { IBCTransfers } from "./IBCTransfers";
import { MaspOverview } from "./MaspOverview";
import { NamTransfer } from "./NamTransfer";
import { Shield } from "./Shield";
import { ShieldAll } from "./ShieldAll";
import TransferRoutes from "./routes";

export const Transfer: React.FC = () => (
  <main className="w-full">
    <Routes>
      <Route
        path={TransferRoutes.masp().toString()}
        element={<MaspOverview />}
      />
      <Route
        path={TransferRoutes.namTransfer().toString()}
        element={<NamTransfer />}
      />
      <Route path={TransferRoutes.shield().toString()} element={<Shield />} />
      <Route
        path={TransferRoutes.shieldAll().toString()}
        element={<ShieldAll />}
      />
      <Route
        path={TransferRoutes.ibcTransfer().toString()}
        element={<IBCTransfers />}
      />
    </Routes>
  </main>
);
