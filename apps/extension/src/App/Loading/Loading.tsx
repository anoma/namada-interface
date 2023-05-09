import { Status } from "App/App";
import React from "react";
import { LoadingError } from "./Loading.components";

type Props = {
  status?: Status;
  error?: string;
};

const Loading: React.FC<Props> = ({ error, status }) => {
  return (
    <div>
      {(status === Status.Failed && (
        <LoadingError>Error: {error}</LoadingError>
      )) || <p>Loading...</p>}
    </div>
  );
};

export default Loading;
