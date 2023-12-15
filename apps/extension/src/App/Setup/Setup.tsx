import { ActionButton, Image, ImageName } from "@namada/components";
import React from "react";
import browser from "webextension-polyfill";
import { SetupContainer } from "./Setup.components";

const Setup: React.FC = () => {
  return (
    <SetupContainer>
      <Image
        styleOverrides={{
          flex: 1,
          width: "100%",
          maxWidth: "50%",
          margin: "0 auto",
        }}
        imageName={ImageName.LogoMinimal}
      />
      <ActionButton
        data-testid="setup-init-button"
        onClick={() => {
          browser.tabs.create({
            url: browser.runtime.getURL("setup.html"),
          });
        }}
      >
        Launch Initial Set-up
      </ActionButton>
    </SetupContainer>
  );
};

export default Setup;
