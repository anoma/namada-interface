import { RoundedLabel } from "@namada/components";
import type { StoryObj } from "@storybook/react";

export default {
  title: "Components/RoundedLabel",
  component: RoundedLabel,
};

type Story = StoryObj<typeof RoundedLabel>;
export const Default: Story = {
  args: {
    children: "Lorem Ipsum Dolor Sit",
  },
};
