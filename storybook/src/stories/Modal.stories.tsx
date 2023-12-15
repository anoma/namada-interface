import { Modal } from "@namada/components";
import type { StoryObj } from "@storybook/react";

export default {
  title: "Components/Modal",
  component: Modal,
  argTypes: {},
};

type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  args: {
    children: (
      <p className="text-neutral-400 py-6">This is the modal content</p>
    ),
    isOpen: true,
    title: "Lorem ipsum",
    onBackdropClick: () => console.log("Backdrop click"),
  },
};
