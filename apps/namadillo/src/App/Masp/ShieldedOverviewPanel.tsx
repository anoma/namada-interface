import { Panel } from "@namada/components";
import { ShieldedAssetTable } from "./ShieldedAssetTable";

export const ShieldedOverviewPanel: React.FC = () => {
  return (
    <Panel
      className="relative pb-6 border border-yellow min-h-[500px] flex flex-col"
      title="Shielded Overview"
    >
      <ShieldedAssetTable />
    </Panel>
  );
};
