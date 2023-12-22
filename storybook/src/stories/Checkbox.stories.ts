import { Checkbox } from "@namada/components";
import type { StoryObj } from "@storybook/react";

export default {
  title: "Components/Checkbox",
  component: Checkbox,
  argTypes: {},
};

type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: {
    className: "text-cyan",
    checked: true,
  },
};
