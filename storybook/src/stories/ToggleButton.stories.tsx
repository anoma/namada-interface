import { ToggleButton } from "@namada/components"; // Adjust the import path to where your Box component is located
import { Meta, StoryObj } from "@storybook/react";

export default {
  title: "Components/ToggleButton",
  component: ToggleButton,
  argTypes: {},
} as Meta;

type Story = StoryObj<typeof ToggleButton>;

export const Default: Story = {
  args: {
    label: "Lorem ipsum",
    onChange: () => console.log("On change event fired"),
    checked: true,
  },
};
