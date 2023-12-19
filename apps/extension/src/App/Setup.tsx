import { ActionButton, Image } from "@namada/components";
import React from "react";
import browser from "webextension-polyfill";

export const Setup: React.FC = () => {
  return (
    <section className="flex flex-col flex-1 justify-between h-full min-h-[330px] -mt-2.5">
      <Image
        styleOverrides={{
          flex: 1,
          width: "100%",
          maxWidth: "50%",
          margin: "0 auto",
        }}
        imageName="LogoMinimal"
      />
      <ActionButton
        data-testid="setup-init-button"
        size="lg"
        onClick={() => {
          browser.tabs.create({
            url: browser.runtime.getURL("setup.html"),
          });
        }}
      >
        Launch Initial Set-up
      </ActionButton>
    </section>
  );
};
