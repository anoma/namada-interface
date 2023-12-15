import { SeedPhraseInstructions } from "@namada/components";
import type { StoryObj } from "@storybook/react";

export default {
  title: "Components/SeedPhraseInstructions",
  component: SeedPhraseInstructions,
  argTypes: {},
};

type Story = StoryObj<typeof SeedPhraseInstructions>;

export const Default: Story = {
  args: {},
};
