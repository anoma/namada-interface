import { Heading } from "@namada/components";
import type { StoryFn, StoryObj } from "@storybook/react";

export default {
  title: "Components/Heading",
  component: Heading,
  argTypes: {
    content: { control: "text" },
  },
  args: {
    content: "Lorem Ipsum",
  },
};

type Story = StoryObj<typeof Heading & { content: string }>;

export const DefaultSizes: Story = {
  decorators: [
    (_Story: StoryFn, context) => {
      const title = context.allArgs.content || "Lorem Ipsum";
      return (
        <div className="flex flex-col gap-4">
          <Heading className="text-xs mb-[0.5em]">{title} (xs)</Heading>
          <Heading className="text-sm mb-[0.5em]">{title} (sm)</Heading>
          <Heading className="text-md mb-[0.5em]">{title} (md)</Heading>
          <Heading className="text-lg mb-[0.5em]">{title} (lg)</Heading>
          <Heading className="text-xl mb-[0.5em]">{title} (xl)</Heading>
          <Heading className="text-2xl mb-[0.5em]">{title} (2xl)</Heading>
          <Heading className="text-3xl mb-[0.5em]">{title} (3xl)</Heading>
          <Heading className="text-4xl mb-[0.5em]">{title} (4xl)</Heading>
          <Heading className="text-5xl mb-[0.5em]">{title} (5xl)</Heading>
          <Heading className="text-6xl mb-[0.5em]">{title} (6xl)</Heading>
          <Heading className="text-7xl mb-[0.5em]">{title} (7xl)</Heading>
          <Heading className="text-8xl mb-[0.5em]">{title} (8xl)</Heading>
          <Heading className="text-9xl mb-[0.5em]">{title} (9xl)</Heading>
        </div>
      );
    },
  ],
};
