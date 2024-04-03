import { Panel } from "@namada/components"; // Adjust the import path to where your Box component is located
import { Meta, StoryObj } from "@storybook/react";

export default {
  title: "Components/Panel",
  component: Panel,
  argTypes: {
    hierarchy: {
      control: {
        type: "select",
        options: ["h1", "h2", "h3", "h4", "h5", "h6"],
      },
    },
    title: { control: "text" },
    children: { control: "text" },
  },
} as Meta;

type Story = StoryObj<typeof Panel>;

export const Default: Story = {
  args: {
    title: "Default Title",
    children: "This is the default content of the Panel.",
  },
};

export const HiddenContent: Story = {
  args: {
    ...Default.args,
    children: (
      <p>
        This is some custom content, including a <strong>strong tag</strong>.
      </p>
    ),
  },
};
