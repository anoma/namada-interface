import { Alert } from "@namada/components";
import type { StoryObj } from "@storybook/react";

export default {
  title: "Components/Alert",
  component: Alert,
  argTypes: {
    type: {
      control: {
        type: "select",
        options: ["success", "error", "warning", "info"],
      },
    },
  },
};

type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  args: {
    title: "Default Alert",
    children: "This is a default alert.",
  },
};

export const Success: Story = {
  args: {
    type: "success",
    title: "Success Alert",
    children: "This is a success alert.",
  },
};

export const Error: Story = {
  args: {
    type: "error",
    title: "Error Alert",
    children: "This is an error alert.",
  },
};

export const Warning: Story = {
  args: {
    type: "warning",
    title: "Warning Alert",
    children: "This is a warning alert.",
  },
};

export const Info: Story = {
  args: {
    type: "info",
    title: "Info Alert",
    children: "This is an info alert.",
  },
};
