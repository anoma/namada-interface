import { InsetLabel } from "@namada/components";
import type { StoryObj } from "@storybook/react";

export default {
  title: "Components/InsetLabel",
  component: InsetLabel,
};

type Story = StoryObj<typeof InsetLabel>;
export const Default: Story = {
  args: {
    color: "light",
    className: "text-xs",
    children: "Lorem Ipsum Dolor Sit",
  },
};
