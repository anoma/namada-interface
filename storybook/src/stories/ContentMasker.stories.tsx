import { ContentMasker } from "@namada/components";
import type { StoryObj } from "@storybook/react";

export default {
  title: "Components/ContentMasker",
  component: ContentMasker,
  argTypes: {},
};

type Story = StoryObj<typeof ContentMasker>;

export const Primary: Story = {
  args: {
    color: "primary",
    children: `Lorem ipsum dolor, sit amet consectetur adipisicing elit. Eum officiis magnam et vel, non nam harum eligendi, dolores rerum error provident. Dolore ullam natus commodi quaerat labore nostrum voluptate repellat.`,
  },
};

export const Secondary: Story = {
  args: {
    ...Primary.args,
    color: "secondary",
  },
};

export const Neutral: Story = {
  args: {
    ...Primary.args,
    color: "neutral",
  },
};

export const Transparent: Story = {
  args: {
    ...Primary.args,
    color: undefined,
  },
};
