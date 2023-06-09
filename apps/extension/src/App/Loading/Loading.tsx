import { Status } from "App/App";
import React from "react";
import { LoadingContainer, LoadingError } from "./Loading.components";

type Props = {
  status?: Status;
  info?: string;
  error?: string;
};

const Loading: React.FC<Props> = ({ error, status, info }) => {
  return (
    <LoadingContainer className={error ? "" : "is-loading"}>
      {(status === Status.Failed && (
        <LoadingError>Error: {error}</LoadingError>
      )) || <p>{info ?? "Loading..."}</p>}
    </LoadingContainer>
  );
};

export default Loading;
