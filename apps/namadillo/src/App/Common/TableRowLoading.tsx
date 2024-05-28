import { SkeletonLoading, Stack } from "@namada/components";
import clsx from "clsx";

type TableRowLoadingProps = { count: number };

export const TableRowLoading = ({
  count = 3,
}: TableRowLoadingProps): JSX.Element => {
  return (
    <Stack gap={1.5}>
      {[...Array(count).keys()].map((_, idx) => (
        <SkeletonLoading
          key={`table-loading-${idx}`}
          width="100%"
          height="60px"
          className={clsx("rounded-md", {
            "bg-neutral-900": idx % 2 === 0,
            "bg-black": idx % 2,
          })}
        />
      ))}
    </Stack>
  );
};
