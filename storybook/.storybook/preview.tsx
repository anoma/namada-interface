import type { Preview } from "@storybook/react";
import { themes } from "@storybook/theming";
import { StoryWrapper } from "../src/StoryWrapper";

import "../src/styles/tailwind-output.css";

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
    docs: {
      theme: themes.dark,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        method: "alphabetical",
        order: ["Introduction", "Components"],
      },
    },
  },
};

export default preview;
