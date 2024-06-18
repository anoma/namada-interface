import clsx from "clsx";

type PageWithSidebar = {
  children: React.ReactNode;
};

export const PageWithSidebar = ({ children }: PageWithSidebar): JSX.Element => {
  return (
    <div
      className={clsx(
        "w-full flex flex-col gap-2 min-h-full lg:grid lg:grid-cols-[auto_240px]"
      )}
    >
      {children}
    </div>
  );
};
