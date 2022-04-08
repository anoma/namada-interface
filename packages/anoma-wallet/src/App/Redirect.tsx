import { useNavigate } from "react-router-dom";
import { Session } from "lib";
import { TopLevelRoute } from "./types";
import { useEffect } from "react";

const Redirect = (): JSX.Element => {
  const navigate = useNavigate();
  const session = new Session().getSession();

  useEffect(() => {
    if (!session) {
      const { pathname } = window.location;
      navigate(`${TopLevelRoute.Home}?redirect=${pathname}`);
    }
  }, [session, navigate]);

  return <div>Redirecting...</div>;
};

export default Redirect;
