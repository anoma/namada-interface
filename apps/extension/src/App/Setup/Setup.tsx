import React from "react";
import { Button, ButtonVariant } from "@anoma/components";
import browser from "webextension-polyfill";

const Setup: React.FC = () => {
  return (
    <Button
      variant={ButtonVariant.ContainedAlternative}
      onClick={() => {
        browser.tabs.create({
          url: browser.runtime.getURL("setup.html"),
        });
      }}
    >
      Launch Initial Set-Up
    </Button>
  );
};

export default Setup;
