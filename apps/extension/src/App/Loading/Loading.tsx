import React from "react";
import { LoadingError } from "./Loading.components";

type Props = {
  error?: string;
};

const Loading: React.FC<Props> = ({ error }) => {
  return !!error ? <div>Loading...</div> : <LoadingError>{error}</LoadingError>;
};

export default Loading;
