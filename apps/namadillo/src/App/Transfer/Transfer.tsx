import { NotFound } from "App/Common/NotFound";
import { Route, Routes } from "react-router-dom";
import { NamTransfer } from "./NamTransfer";
import { TransferRoutes } from "./routes";

export const Transfer: React.FC = () => (
  <Routes>
    <Route
      path={TransferRoutes.namTransfer().toString()}
      element={<NamTransfer />}
    />
    <Route path="*" element={<NotFound />} />
  </Routes>
);
