import { Loading } from "@namada/components";
import type { StoryObj } from "@storybook/react";

export default {
  title: "Components/Loading",
  component: Loading,
  argTypes: {},
};

type Story = StoryObj<typeof Loading>;

export const Default: Story = {
  args: {
    status: "This is an example status...",
    visible: true,
    variant: "full",
  },
};
