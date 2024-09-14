import { Route, Routes } from "react-router-dom";
import { IBCTransfers } from "./IBCTransfers";
import { ShieldAll } from "./ShieldAll";
import TransferRoutes from "./routes";

export const Transfer: React.FC = () => (
  <main className="w-full">
    <Routes>
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
