import "@namada/components/src/base.css";

import { getTheme } from "@namada/utils";
import { ThemeProvider } from "styled-components";

type StoryWrapperProps = {
  children: React.ReactNode;
};

export const StoryWrapper = ({ children }: StoryWrapperProps): JSX.Element => {
  const theme = getTheme("dark");
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
