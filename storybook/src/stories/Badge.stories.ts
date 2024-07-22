import { Badge } from "@namada/components";
import type { StoryObj } from "@storybook/react";

export default {
  title: "Components/Badge",
  component: Badge,
};

type Story = StoryObj<typeof Badge>;
export const Default: Story = {
  args: {
    className: "bg-yellow inline-flex",
    children: "This is a badge",
  },
};
