import "@namada/components/src/base.css";

type StoryWrapperProps = {
  children: React.ReactNode;
};

export const StoryWrapper = ({ children }: StoryWrapperProps): JSX.Element => {
  return <>{children}</>;
};
