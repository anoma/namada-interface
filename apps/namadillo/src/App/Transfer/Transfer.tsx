import { NotFound } from "App/Common/NotFound";
import { Route, Routes } from "react-router-dom";
import { Example } from "./Example";
import { NamTransfer } from "./NamTransfer";
import { ShieldAll } from "./ShieldAll";
import { TransferRoutes } from "./routes";

export const Transfer: React.FC = () => (
  <Routes>
    <Route
      path={TransferRoutes.namTransfer().toString()}
      element={<NamTransfer />}
    />
    <Route
      path={TransferRoutes.shieldAll().toString()}
      element={<ShieldAll />}
    />
    <Route path={TransferRoutes.example().toString()} element={<Example />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);
