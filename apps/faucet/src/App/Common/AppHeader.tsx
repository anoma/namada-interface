import { Heading } from "@namada/components";
import { AppContext } from "App/App";
import React, { useContext } from "react";
import { GoGear } from "react-icons/go";
import { AppHeaderContainer, SettingsButton } from "./AppHeader.components";

export const AppHeader: React.FC = () => {
  const { setIsModalOpen } = useContext(AppContext)!;
  return (
    <AppHeaderContainer>
      <Heading className="uppercase text-black text-4xl" level="h1">
        Namada Faucet
      </Heading>
      <SettingsButton onClick={() => setIsModalOpen(true)}>
        <GoGear />
      </SettingsButton>
    </AppHeaderContainer>
  );
};
