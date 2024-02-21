import { ActionButton, Heading, Stack } from "@namada/components";
import clsx from "clsx";

type LedgerStepProps = {
  title: string;
  text: string;
  onClick: () => void;
  buttonDisabled: boolean;
  active: boolean;
  complete: boolean;
  image: React.ReactNode;
};

export const LedgerStep = ({
  title,
  text,
  onClick,
  active,
  complete,
  buttonDisabled,
  image,
}: LedgerStepProps): JSX.Element => {
  return (
    <li
      className={clsx(
        "grid items-center border rounded-lg gap-5 grid-cols-[128px_auto]",
        "p-4 transition-all duration-100",
        {
          "border-yellow": active,
          "border-transparent": !active,
          "opacity-25 cursor-default": complete,
          "opacity-100 cursor-auto": !complete,
        }
      )}
    >
      <i
        className={clsx(
          "flex items-center bg-black rounded-lg",
          "h-30 justify-center py-4 px-9 w-full"
        )}
      >
        {image}
      </i>
      <Stack gap={1}>
        <Heading
          level="h2"
          className="text-base uppercase text-yellow font-medium"
        >
          {title}
        </Heading>
        <p className="font-medium text-white text-base">{text}</p>
        <div className="max-w-[80px] mt-1">
          <ActionButton disabled={buttonDisabled} size="xs" onClick={onClick}>
            Next
          </ActionButton>
        </div>
      </Stack>
    </li>
  );
};
