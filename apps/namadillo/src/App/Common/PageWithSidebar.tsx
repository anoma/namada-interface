import clsx from "clsx";
import { Footer } from "./Footer";

type PageWithSidebar = {
  footerClassName?: string;
  children: React.ReactNode;
};

export const PageWithSidebar = ({
  children,
  footerClassName,
}: PageWithSidebar): JSX.Element => {
  return (
    <div className="w-full lg:grid lg:grid-cols-[auto_240px] gap-2 lg:grid-rows-[auto_max-content]">
      {children}
      <Footer className={clsx(footerClassName)} />
    </div>
  );
};
