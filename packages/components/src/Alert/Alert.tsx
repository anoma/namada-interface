import {
  AlertContent,
  AlertError,
  AlertInfo,
  AlertSuccess,
  AlertTitle,
  AlertWarning,
} from "./Alert.components";

const AlertType = {
  error: AlertError,
  warning: AlertWarning,
  info: AlertInfo,
  success: AlertSuccess,
};

type AlertProps = {
  type?: keyof typeof AlertType;
  title?: string;
  children: React.ReactNode;
};

export const Alert = ({
  type = "info",
  title,
  children,
}: AlertProps): JSX.Element => {
  const AlertComponent = AlertType[type] ?? AlertInfo;

  return (
    <AlertComponent role="alert">
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertContent>{children}</AlertContent>
    </AlertComponent>
  );
};
