import { Alert } from "@namada/components";
import { Status } from "./types";

type Props = {
  status?: Status;
  idleText?: string;
  pendingText?: string;
  errorText?: string;
};

export const StatusBox: React.FC<Props> = ({
  status,
  idleText,
  pendingText,
  errorText,
}) => {
  if (!status) {
    return <>{idleText && <Alert type="warning">{idleText}</Alert>}</>;
  }
  if (status === Status.Pending) {
    return <Alert type="info">{pendingText}</Alert>;
  }
  if (status === Status.Failed) {
    return (
      <Alert type="error">
        {errorText}
        <br />
        Try again
      </Alert>
    );
  }
  return null;
};
