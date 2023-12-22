import { ActionButton } from "@namada/components";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof ActionButton> = {
  title: "Components/ActionButton",
  component: ActionButton,
  argTypes: {
    size: {
      options: ["xs", "sm", "md", "lg", "xl"],
      control: { type: "select" },
    },
    color: {
      options: ["primary", "secondary", "black"],
      control: { type: "select" },
    },
    hoverColor: {
      options: ["primary", "secondary", "black"],
      control: { type: "select" },
    },
    borderRadius: {
      options: ["sm", "md", "lg"],
      control: { type: "select" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ActionButton>;

export const Primary: Story = {
  args: {
    children: "Primary Button",
    color: "primary",
    hoverColor: "black",
    size: "md",
    borderRadius: "md",
    outlined: false,
    disabled: false,
  },
};

export const Secondary: Story = {
  args: {
    ...Primary.args,
    color: "secondary",
    children: "Secondary Button",
  },
};

export const Black: Story = {
  args: {
    ...Primary.args,
    color: "black",
    children: "Black Button",
  },
};

export const OutlinedPrimary: Story = {
  args: {
    ...Primary.args,
    outlined: true,
    children: "Outlined Primary Button",
  },
};

export const OutlinedSecondary: Story = {
  args: {
    ...Primary.args,
    color: "secondary",
    outlined: true,
    children: "Outlined Secondary Button",
  },
};

export const OutlinedBlack: Story = {
  args: {
    ...Primary.args,
    color: "black",
    outlined: true,
    children: "Outlined Black Button",
  },
};

export const Disabled: Story = {
  args: {
    ...Primary.args,
    disabled: true,
    children: "Disabled Button",
  },
};
