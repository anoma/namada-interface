import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TopLevelRoute } from "./types";
import { useSanitizedLocation } from "@namada/hooks";

type Props = {
  password?: string;
};

const Redirect = ({ password }: Props): JSX.Element => {
  const navigate = useNavigate();
  const location = useSanitizedLocation();

  useEffect(() => {
    if (!password) {
      const { pathname } = location;
      navigate(`${TopLevelRoute.Wallet}?redirect=${pathname}`);
    }
  });

  return <div>Redirecting...</div>;
};

export default Redirect;
