import { SegmentedBar } from "@namada/components";
import type { StoryObj } from "@storybook/react";
import BigNumber from "bignumber.js";

export default {
  title: "Components/SegmentedBar",
  component: SegmentedBar,
};

type Story = StoryObj<typeof SegmentedBar>;
export const Default: Story = {
  args: {
    data: [
      { value: 100, color: " #ffff00" },
      { value: new BigNumber("200"), color: "#ff00ff" },
      { value: 400, color: "#00ffff" },
    ],
  },
};
