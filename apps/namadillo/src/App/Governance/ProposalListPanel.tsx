import { Panel, SkeletonLoading } from "@namada/components";
import { AtomErrorBoundary } from "App/Common/AtomErrorBoundary";
import { atomsAreFetching, atomsAreLoaded } from "atoms/utils";
import { AtomWithQueryResult } from "jotai-tanstack-query";
import { ReactNode } from "react";

type ProposalListPanelProps = {
  title: string;
  atoms: AtomWithQueryResult[];
  children: ReactNode;
  errorText: string;
  emptyText?: string;
  isEmpty?: boolean;
  className?: string;
};

export const ProposalListPanel = ({
  title,
  atoms,
  children,
  errorText,
  emptyText,
  isEmpty,
  className,
}: ProposalListPanelProps): JSX.Element => {
  const loaded = atomsAreLoaded(...atoms);
  return (
    <Panel title={title} className={className}>
      <AtomErrorBoundary
        result={atoms}
        niceError={errorText}
        containerProps={{ className: "pb-14 h-[130px]" }}
      >
        {atomsAreFetching(...atoms) && (
          <SkeletonLoading height="150px" width="100%" />
        )}
        {loaded && !isEmpty && children}
        {loaded && isEmpty && (
          <div className="pb-10 flex items-center justify-center text-sm text-neutral-400">
            {emptyText}
          </div>
        )}
      </AtomErrorBoundary>
    </Panel>
  );
};
