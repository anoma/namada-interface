import clsx from "clsx";

type PageWithSidebar = {
  children: React.ReactNode;
};

export const PageWithSidebar = ({ children }: PageWithSidebar): JSX.Element => {
  return (
    <div
      className={clsx("w-full min-h-full grid xl:grid-cols-[auto_240px] gap-2")}
    >
      {children}
    </div>
  );
};
