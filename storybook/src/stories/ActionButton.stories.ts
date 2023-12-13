import type { Meta, StoryObj } from "@storybook/react";

import { ActionButton } from "@namada/components";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta: Meta<typeof ActionButton> = {
  title: "Components/ActionButton",
  component: ActionButton,
};

export default meta;
type Story = StoryObj<typeof ActionButton>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    children: "Test",
  },
};
