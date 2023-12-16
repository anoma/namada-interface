import {
  ActionButton,
  Heading,
  Icon,
  NavigationContainer,
} from "@namada/components";
import { useNavigate } from "react-router-dom";

import {
  ButtonsContainer,
  NotFoundContainer,
  NotFoundContent,
} from "./NotFound.components";
import { BackButton } from "./Token/TokenSend/TokenSendForm.components";
import { TopLevelRoute } from "./types";

const NotFound = (): JSX.Element => {
  const navigate = useNavigate();
  const handleWalletClick = (): void => {
    navigate(TopLevelRoute.Wallet);
  };
  return (
    <NotFoundContainer>
      <NavigationContainer>
        <Heading level="h1">Oops!</Heading>
      </NavigationContainer>
      <NotFoundContent>
        <Heading level="h1">Page not found.</Heading>
        <ActionButton onClick={handleWalletClick}>
          Return to wallet
        </ActionButton>
      </NotFoundContent>
      <ButtonsContainer>
        <BackButton onClick={() => navigate(TopLevelRoute.Wallet)}>
          <Icon name="ChevronLeft" />
        </BackButton>
      </ButtonsContainer>
    </NotFoundContainer>
  );
};

export default NotFound;
