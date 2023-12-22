import { LinkButton } from "@namada/components";
import type { StoryObj } from "@storybook/react";

export default {
  title: "Components/LinkButton",
  component: LinkButton,
  argTypes: {
    color: {
      control: { type: "select" },
      options: ["primary", "secondary", "neutral"],
    },
  },
};

type Story = StoryObj<typeof LinkButton>;

export const Default: Story = {
  args: {
    color: "neutral",
    underline: false,
    href: "#",
    children: "Lorem ipsum",
  },
};
