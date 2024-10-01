import { NotFound } from "App/Common/NotFound";
import { Route, Routes } from "react-router-dom";
import { IbcTransfer } from "./IbcTransfer";
import { IbcRoutes } from "./routes";
import { ShieldAll } from "./ShieldAll";
import { Withdraw } from "./Withdraw";

export const Ibc: React.FC = () => (
  <Routes>
    <Route path={`${IbcRoutes.ibcTransfer()}`} element={<IbcTransfer />} />
    <Route path={`${IbcRoutes.withdraw()}`} element={<Withdraw />} />
    <Route path={`${IbcRoutes.shieldAll()}`} element={<ShieldAll />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);
