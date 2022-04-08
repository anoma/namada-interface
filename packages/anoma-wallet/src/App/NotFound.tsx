import { useNavigate } from "react-router-dom";
import { TopLevelRoute } from "./types";
import { Heading, HeadingLevel } from "components/Heading";
import { Button, ButtonVariant } from "components/Button";
import { NavigationContainer } from "components/NavigationContainer";
import { NotFoundContainer } from "./NotFound.components";
const NotFound = (): JSX.Element => {
  const navigate = useNavigate();
  const handleWalletClick = (): void => {
    navigate(TopLevelRoute.Wallet);
  };
  return (
    <NotFoundContainer>
      <NavigationContainer
        onBackButtonClick={() => {
          navigate(-1);
        }}
      >
        <Heading level={HeadingLevel.One}>Oops!</Heading>
      </NavigationContainer>
      <div>
        <Heading level={HeadingLevel.One}>Page not found.</Heading>
        <Button onClick={handleWalletClick} variant={ButtonVariant.Small}>
          Return to wallet
        </Button>
      </div>
    </NotFoundContainer>
  );
};

export default NotFound;
