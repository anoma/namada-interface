import { ProgressIndicator } from "@namada/components";
import type { StoryObj } from "@storybook/react";

export default {
  title: "Components/ProgressIndicator",
  component: ProgressIndicator,
  argTypes: {},
};

type Story = StoryObj<typeof ProgressIndicator>;

export const Default: Story = {
  args: {
    keyName: "progress-indicator-test",
    currentStep: 3,
    totalSteps: 5,
  },
};
