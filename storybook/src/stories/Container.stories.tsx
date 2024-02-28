// accordion.stories.js

import { Container } from "@namada/components";
import type { StoryObj } from "@storybook/react";

export default {
  title: "Components/Container",
  component: Container,
  argTypes: {
    size: {
      options: ["base", "popup"],
      control: { type: "select" },
    },
  },
};

type Story = StoryObj<typeof Container>;

export const NormalContainer: Story = {
  args: {
    header: <h2 className="text-white">Default Header</h2>,
    size: "base",
    children: (
      <p className="text-yellow">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Laboriosam, id
        eius! Hic molestias labore quas neque incidunt exercitationem facere
        expedita! Nemo fuga ab similique quas culpa delectus non officia
        aperiam.
      </p>
    ),
  },
};

export const PopupContainer: Story = {
  args: {
    ...NormalContainer.args,
    size: "popup",
  },
};

export const CustomContainer: Story = {
  args: {
    ...NormalContainer.args,
    size: "base",
    className: "bg-neutral-400",
  },
};
