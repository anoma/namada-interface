import { Stack } from "@namada/components";
import clsx from "clsx";
import { tv } from "tailwind-variants";

const progressIndicator = tv({
  slots: {
    container: "mx-auto flex justify-center",
    listItem: clsx(
      "bg-neutral-900 rounded-full overflow-hidden relative w-[10px] h-[10px]",
      "before:absolute before:h-full before:w-full before:left-0 before:top-0",
      "before:bg-yellow before:transition-all before:duration-100 before:ease-out",
      "[&[aria-current='true']]:before:translate-x-0"
    ),
  },
  variants: {
    active: {
      true: {
        listItem: "before:translate-x-0",
      },
      false: {
        listItem: "before:-translate-x-full",
      },
    },
  },
});

type ProgressIndicatorProps = {
  totalSteps: number;
  currentStep: number;
  keyName: string;
};

export const ProgressIndicator = ({
  totalSteps,
  currentStep,
}: ProgressIndicatorProps): JSX.Element => {
  const { container, listItem } = progressIndicator();
  return (
    <div className={container()} role="group" aria-label="Progress">
      <Stack as="ol" gap={2} direction="horizontal">
        {[...Array(totalSteps)].map((_, idx) => (
          <li
            key={`step-${idx}`}
            className={listItem({ active: idx <= currentStep - 1 })}
            aria-current={idx === currentStep - 1}
          />
        ))}
      </Stack>
    </div>
  );
};
