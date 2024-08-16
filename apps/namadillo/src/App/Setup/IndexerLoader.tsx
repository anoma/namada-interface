import { indexerUrlAtom } from "atoms/settings";
import { useAtomValue } from "jotai";
import { ReactNode } from "react";
import { Setup } from "../Common/Setup";

export const IndexerLoader = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  const indexerUrl = useAtomValue(indexerUrlAtom);

  if (!indexerUrl) {
    return <Setup />;
  }

  return <>{children}</>;
};
