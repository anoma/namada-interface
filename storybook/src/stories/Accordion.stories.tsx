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

export const DefaultAccordion: Story = {
  args: {
    title: "Default Title",
    children: "This is the default content",
    color: "primary",
  },
};

export const SecondaryAccordion: Story = {
  args: {
    ...DefaultAccordion.args,
    color: "secondary",
  },
};

export const NeutralAccordion: Story = {
  args: {
    ...DefaultAccordion.args,
    color: "neutral",
  },
};
