import type { Preview } from "@storybook/react";
import { getTheme } from "@namada/utils";
import { ThemeProvider } from "styled-components";
import React from "react";
import { StoryWrapper } from "../src/StoryWrapper";

const preview: Preview = {
  decorators: [
    (Story) => {
      return (
        <StoryWrapper>
          <Story />
        </StoryWrapper>
      );
    },
  ],
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
