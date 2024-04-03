import { PieChart } from "@namada/components";
import type { StoryFn, StoryObj } from "@storybook/react";

export default {
  title: "Components/PieChart",
  component: PieChart,
  argTypes: {},
};

type Story = StoryObj<typeof PieChart>;

export const Default: Story = {
  args: {
    data: [
      { value: 100.0, color: "#ffff00" },
      { value: 12, color: "#f0f0f0" },
      { value: 24, color: "#ff00ff" },
    ],
  },
  decorators: [
    (Story: StoryFn, context) => {
      const children = (
        <div className="text-white">
          <div className="text-2xl">Total Stake Balance</div>
          <div className="text-4xl">
            XX <strong>NAM</strong>
          </div>
        </div>
      );
      return <Story args={{ ...context.args, children }} />;
    },
  ],
};
