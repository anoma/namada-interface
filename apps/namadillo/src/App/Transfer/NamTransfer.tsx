import { PageWithSidebar } from "App/Common/PageWithSidebar";
import { Example } from "./Example";

export const NamTransfer: React.FC = () => {
  return (
    <PageWithSidebar>
      <div className="flex flex-col gap-2 text-yellow">
        <div>Transfer: Nam Transfer (WIP)</div>
        <Example />
      </div>
      <aside className="flex flex-col gap-2 text-yellow">
        <div>Sidebar (WIP)</div>
      </aside>
    </PageWithSidebar>
  );
};
