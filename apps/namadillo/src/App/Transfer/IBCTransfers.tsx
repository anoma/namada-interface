import { Panel } from "@namada/components";
import { IBCFromNamadaModule } from "./IBCFromNamadaModule";

export const IBCTransfers = (): JSX.Element => {
  return (
    <div>
      <Panel>
        <IBCFromNamadaModule />
      </Panel>
    </div>
  );
};
