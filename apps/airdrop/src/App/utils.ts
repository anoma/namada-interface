import { NavigateFunction } from "react-router-dom";

export const navigatePostCheck = (
  navigate: NavigateFunction,
  eligible: boolean,
  hasClaimed: boolean,
  replace = false
): void => {
  console.log("navigatePostCheck", eligible, hasClaimed);
  if (eligible && !hasClaimed) {
    navigate("/claim/info", { replace });
  } else if (eligible && hasClaimed) {
    navigate("/airdrop-confirmed", { replace });
  } else if (!eligible) {
    navigate("/non-eligible", { replace });
  }
};
