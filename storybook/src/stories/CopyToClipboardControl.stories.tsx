import { CopyToClipboardControl } from "@namada/components";
import type { StoryObj } from "@storybook/react";

export default {
  title: "Components/CopyToClipboardControl",
  component: CopyToClipboardControl,
};

type Story = StoryObj<typeof CopyToClipboardControl>;
export const Default: Story = {
  args: {
    className: "inline-flex bg-neutral-200 px-6 py-2 rounded-lg",
    children: "Click here to Copy",
    value: "Value copied",
  },
};
