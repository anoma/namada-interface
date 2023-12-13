import { getTheme } from "@namada/utils";
import { ThemeProvider } from "styled-components";
import "./index.css";

type StoryWrapperProps = {
  children: React.ReactNode;
};

export const StoryWrapper = ({ children }: StoryWrapperProps) => {
  const theme = getTheme("dark");
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
