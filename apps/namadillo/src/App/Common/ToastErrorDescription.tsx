import { useState } from "react";
import { TextLink } from "./TextLink";

export const ToastErrorDescription: React.FC<{
  basicMessage?: React.ReactNode;
  errorMessage?: string;
}> = ({ basicMessage, errorMessage }) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  const errorPart = (() => {
    if (typeof errorMessage === "undefined") {
      return null;
    }

    return expanded ?
        <div style={{ overflowWrap: "anywhere" }}>{errorMessage}</div>
      : <TextLink onClick={() => setExpanded(!expanded)}>
          Show error message
        </TextLink>;
  })();

  return (
    <>
      {basicMessage}
      {basicMessage && <br />}
      {basicMessage && expanded && <br />}
      {errorPart}
    </>
  );
};
