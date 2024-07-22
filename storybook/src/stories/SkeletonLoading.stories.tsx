import { SkeletonLoading } from "@namada/components";
import type { StoryObj } from "@storybook/react";

export default {
  title: "Components/SkeletonLoading",
  component: SkeletonLoading,
};

type Story = StoryObj<typeof SkeletonLoading>;
export const Default: Story = {
  args: {
    width: "100%",
    height: "300px",
  },
};

export const DifferentHeight: Story = {
  args: {
    className: "bg-neutral-200",
    width: "300px",
    height: "800px",
  },
};

export const Circle: Story = {
  args: {
    className: "rounded-full bg-neutral-200",
    width: "150px",
    height: "150px",
  },
};
