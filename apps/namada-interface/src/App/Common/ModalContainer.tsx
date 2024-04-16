import { Stack } from "@namada/components";

type ModalContainerProps = {
  children: React.ReactNode;
  header: React.ReactNode;
};

export const ModalContainer = ({
  header,
  children,
}: ModalContainerProps): JSX.Element => {
  return (
    <div className="w-[75vw] px-6 py-6 bg-neutral-800 text-white rounded-md">
      <header className="flex w-full justify-center items-center relative mb-4 text-xl text-medium">
        {header}
      </header>
      <Stack gap={2}>{children}</Stack>
    </div>
  );
};
