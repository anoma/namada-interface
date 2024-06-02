import { Tooltip } from "@namada/components";
import type { StoryFn, StoryObj } from "@storybook/react";
import { TooltipStory } from "components/TooltipStory";

export default {
  title: "Components/Tooltip",
  component: Tooltip,
  argTypes: {},
};

type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  args: {
    children: "This is the tooltip",
    position: "top",
  },
  decorators: [
    (Story: StoryFn, context) => {
      return (
        <TooltipStory>
          <Story />
        </TooltipStory>
      );
    },
  ],
};
