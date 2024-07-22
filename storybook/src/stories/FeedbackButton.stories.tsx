import { FeedbackButton } from "@namada/components";
import type { StoryObj } from "@storybook/react";

export default {
  title: "Components/FeedbackButton",
  component: FeedbackButton,
};

type Story = StoryObj<typeof FeedbackButton>;
export const Default: Story = {
  args: {
    children: "Click me!",
    successMessage: "Success!",
    errorMessage: "Error!",
    onAction: () => console.log("onAction fired"),
    className: "text-sm text-neutral-900 hover:text-neutral-500 text-center",
  },
};
