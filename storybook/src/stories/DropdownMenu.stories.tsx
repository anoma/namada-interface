import { DropdownMenu } from "@namada/components";
import type { StoryFn, StoryObj } from "@storybook/react";

type Story = StoryObj<typeof DropdownMenu>;

export default {
  title: "Components/DropdownMenu",
  component: DropdownMenu,
  argTypes: {},
  decorators: [
    (Story: StoryFn) => (
      <div className="bg-neutral-200 h-[75vh] px-10 flex items-center justify-end">
        {<Story />}
      </div>
    ),
  ],
};

export const Default: Story = {
  args: {
    id: "default",
    items: [
      {
        label: "First Item",
        onClick: () => {
          console.log("First item clicked");
        },
      },
      {
        label: "Second Item",
        onClick: () => console.log("Second item clicked"),
      },
      {
        label: "Third Item (disabled)",
      },
    ],
  },
};

export const AlignLeft: Story = {
  args: { ...Default.args, align: "left" },
};

export const AlignCenter: Story = {
  args: { ...Default.args, align: "center" },
};

export const PositionBottom: Story = {
  args: { ...Default.args, position: "bottom" },
};
