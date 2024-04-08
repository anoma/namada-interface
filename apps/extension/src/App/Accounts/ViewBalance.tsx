import { useContext } from "react";
import { GoArrowUpRight } from "react-icons/go";

import {
  ActionButton,
  GapPatterns,
  RadioGroup,
  Ring,
  Stack,
} from "@namada/components";
import { PageHeader } from "App/Common";
import { AccountContext } from "context";

const { NAMADA_INTERFACE_DASHBOARD_URL: dashboardUrl } = process.env;

export const ViewBalance = (): JSX.Element => {
  const { getById, activeAccountId, transparentBalance } =
    useContext(AccountContext);
  const activeAccount = activeAccountId ? getById(activeAccountId) : undefined;

  const alias = activeAccount?.alias || "";

  const balanceString =
    typeof transparentBalance === "undefined" ? "-" : (
      transparentBalance.toString() + " NAM"
    );

  const handleOpenDashboard = (): void => {
    window.open(dashboardUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Stack gap={GapPatterns.TitleContent}>
      <PageHeader title={alias} />
      <RadioGroup
        id="balanceType"
        groupLabel="Type of balance"
        value="transparent"
        options={[
          { text: "Transparent", value: "transparent" },
          { text: "Shielded", value: "shielded" },
        ]}
        disabled={true}
      />

      <Ring radius={40} strokeWidth={5} color="#FFFF00">
        {/* TODO: where should the color code be defined? */}
        <div className="text-center text-[#989898] text-base">
          <div>Total Balance</div>
          <div className="text-4xl text-white">{balanceString}</div>
          <div>$0.00</div>
        </div>
      </Ring>

      <ActionButton
        size="sm"
        borderRadius="sm"
        outlined={true}
        onClick={handleOpenDashboard}
      >
        Manage Portfolio in Namada Dashboard
        <GoArrowUpRight className="inline-block stroke-2" />
      </ActionButton>
    </Stack>
  );
};
