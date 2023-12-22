import { Select } from "@namada/components";
import type { StoryObj } from "@storybook/react";

export default {
  title: "Components/SelectBox",
  component: Select,
  argTypes: {},
};

type Story = StoryObj<typeof Select>;

export const Default: Story = {
  args: {
    data: [
      { value: "option-1", label: "Test Option #1" },
      { value: "option-2", label: "Test Option #2" },
      { value: "option-3", label: "Test Option #3" },
    ],
    value: "option-1",
    label: "This is the label",
    onChange: () => {},
  },
};
