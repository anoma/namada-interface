import type { StoryObj } from "@storybook/react";
import { CheatSheet as Component } from "components/Cheatsheet";

export default {
  title: "Introduction",
  component: Component,
};

type Story = StoryObj<typeof Component>;
export const CheatSheet: Story = {
  args: {},
};
