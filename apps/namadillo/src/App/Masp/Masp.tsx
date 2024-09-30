import { NotFound } from "App/Common/NotFound";
import { Route, Routes } from "react-router-dom";
import { MaspOverview } from "./MaspOverview";
import { MaspRoutes } from "./routes";
import { Shield } from "./Shield";
import { Unshield } from "./Unshield";

export const Masp: React.FC = () => (
  <Routes>
    <Route path={`${MaspRoutes.overview()}`} element={<MaspOverview />} />
    <Route path={`${MaspRoutes.shield()}`} element={<Shield />} />
    <Route path={`${MaspRoutes.unshield()}`} element={<Unshield />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);
