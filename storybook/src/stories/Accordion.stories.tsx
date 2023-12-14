// accordion.stories.js

import { Accordion } from "@namada/components";
import type { StoryObj } from "@storybook/react";

export default {
  title: "Components/Accordion",
  component: Accordion,
  argTypes: {
    color: {
      options: ["primary", "secondary", "neutral"],
      control: { type: "select" },
    },
  },
};

type Story = StoryObj<typeof Accordion>;

export const NormalAccordion: Story = {
  args: {
    title: "Default Title",
    children: "This is the default content",
    color: "primary",
  },
};
