import { Stack } from "@namada/components";
import type { StoryObj } from "@storybook/react";

export default {
  title: "Components/Stack",
  component: Stack,
  argTypes: {
    gap: {
      control: {
        type: "number",
      },
    },
  },
};

type Story = StoryObj<typeof Stack>;

export const VerticalStack: Story = {
  args: {
    as: "ul",
    direction: "vertical",
    gap: 4,
    children: (
      <>
        <li>Item #1</li>
        <li>Item #2</li>
        <li>Item #3</li>
        <li>Item #4</li>
      </>
    ),
  },
};

export const HorizontalStack: Story = {
  args: {
    ...VerticalStack.args,
    direction: "horizontal",
  },
};
