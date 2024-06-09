import clsx from "clsx";
import { Footer } from "./Footer";
import { PageErrorBoundary } from "./PageErrorBoundary";

type PageWithSidebar = {
  footerClassName?: string;
  children: React.ReactNode;
};

export const PageWithSidebar = ({
  children,
  footerClassName,
}: PageWithSidebar): JSX.Element => {
  return (
    <div
      className={clsx(
        "w-full flex flex-col gap-2 lg:grid lg:grid-cols-[auto_240px]",
        "lg:grid-rows-[auto_max-content]"
      )}
    >
      <PageErrorBoundary>{children}</PageErrorBoundary>
      <Footer className={clsx(footerClassName)} />
    </div>
  );
};
