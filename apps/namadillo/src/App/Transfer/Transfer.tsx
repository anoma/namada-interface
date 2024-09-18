import { Route, Routes } from "react-router-dom";
import { InternalTransfer } from "./InternalTransfer";
import { Shield } from "./Shield";
import { ShieldAll } from "./ShieldAll";
import TransferRoutes from "./routes";

export const Transfer: React.FC = () => (
  <main className="w-full">
    <Routes>
      <Route
        path={TransferRoutes.transfer().toString()}
        element={<InternalTransfer />}
      />
      <Route path={TransferRoutes.shield().toString()} element={<Shield />} />
      <Route
        path={TransferRoutes.shieldAll().toString()}
        element={<ShieldAll />}
      />
    </Routes>
  </main>
);
