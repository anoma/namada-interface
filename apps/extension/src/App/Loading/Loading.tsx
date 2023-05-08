import React from "react";
import { Status } from "App/App";
import { LoadingError } from "./Loading.components";

type Props = {
  error?: string;
  status?: Status;
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
