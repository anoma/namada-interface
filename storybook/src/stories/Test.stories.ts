import type { Meta, StoryObj } from "@storybook/react";

import { Test } from "@namada/components";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta: Meta<typeof Test> = {
  title: "Components/Test",
  component: Test,
};

export default meta;
type Story = StoryObj<typeof Test>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {},
};
