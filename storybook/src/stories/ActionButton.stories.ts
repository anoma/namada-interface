import { ActionButton } from "@namada/components";
import { colors } from "@namada/components/src/theme";
import type { Meta, StoryObj } from "@storybook/react";

const colorOption = Object.keys(colors);

const meta: Meta<typeof ActionButton> = {
  title: "Components/ActionButton",
  component: ActionButton,
  argTypes: {
    size: {
      options: ["xs", "sm", "md", "lg", "xl"],
      control: { type: "select" },
    },
    outlineColor: {
      options: colorOption,
      control: { type: "select" },
    },
    backgroundColor: {
      options: colorOption,
      control: { type: "select" },
    },
    backgroundHoverColor: {
      options: colorOption,
      control: { type: "select" },
    },
    textColor: {
      options: colorOption,
      control: { type: "select" },
    },
    textHoverColor: {
      options: colorOption,
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

export const Solid: Story = {
  args: {
    children: "Primary Button",
    color: "primary",
    size: "md",
    borderRadius: "md",
    disabled: false,
  },
};

export const Outlined: Story = {
  args: {
    ...Solid.args,
    outlineColor: "yellow",
    children: "Outlined Primary Button",
  },
};

export const Disabled: Story = {
  args: {
    ...Solid.args,
    disabled: true,
    children: "Disabled Button",
  },
};
