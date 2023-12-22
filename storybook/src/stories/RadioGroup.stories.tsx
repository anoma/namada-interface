import { RadioGroup } from "@namada/components";
import type { StoryObj } from "@storybook/react";

export default {
  title: "Components/RadioGroup",
  component: RadioGroup,
  argTypes: {},
};

type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  args: {
    id: "number-of-seeds",
    groupLabel: "Number of Seeds",
    value: "12",
    options: [
      { text: "12 words", value: "12" },
      { text: "24 words", value: "24" },
      { text: "48 words", value: "48" },
      { text: "96 magic words", value: "96" },
    ],
    onChange: () => {},
  },
};
