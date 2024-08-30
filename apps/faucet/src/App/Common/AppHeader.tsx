import { Heading } from "@namada/components";
import React from "react";
import { AppHeaderContainer } from "./AppHeader.components";

export const AppHeader: React.FC = () => {
  return (
    <AppHeaderContainer>
      <Heading className="uppercase text-black text-4xl" level="h1">
        Namada Faucet
      </Heading>
    </AppHeaderContainer>
  );
};
