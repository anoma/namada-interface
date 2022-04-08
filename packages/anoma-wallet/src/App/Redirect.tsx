import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Session } from "lib";
import { TopLevelRoute } from "./types";

const Redirect = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const session = new Session().getSession();

  useEffect(() => {
    if (!session) {
      const { pathname } = location;
      navigate(`${TopLevelRoute.Home}?redirect=${pathname}`);
    }
  });

  return <div>Redirecting...</div>;
};

export default Redirect;
