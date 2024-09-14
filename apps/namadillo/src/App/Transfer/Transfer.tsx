import { Route, Routes } from "react-router-dom";
import { ShieldAll } from "./ShieldAll";
import TransferRoutes from "./routes";

export const Transfer: React.FC = () => (
  <main className="w-full">
    <Routes>
      <Route
        path={TransferRoutes.shieldAll().toString()}
        element={<ShieldAll />}
      />
    </Routes>
  </main>
);
