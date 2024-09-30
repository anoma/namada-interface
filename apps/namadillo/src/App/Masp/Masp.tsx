import { NotFound } from "App/Common/NotFound";
import { Route, Routes } from "react-router-dom";
import { MaspOverview } from "./MaspOverview";
import { MaspRoutes } from "./routes";

export const Masp: React.FC = () => (
  <Routes>
    <Route path={`${MaspRoutes.overview()}`} element={<MaspOverview />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);
