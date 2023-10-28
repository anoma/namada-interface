import { useEffect } from "react";

type Props = {
  onLoad?: () => void;
  onUnload?: () => void;
  children: React.ReactNode;
};

export const LifecycleExecutionWrapper = ({
  onLoad,
  onUnload,
  children,
}: Props): JSX.Element => {
  useEffect(() => {
    onLoad && onLoad();
    return () => {
      onUnload && onUnload();
    };
  }, []);

  return <>{children}</>;
};
