import { Stack } from "@namada/components";
import { Outlet, useLocation } from "react-router-dom";
import { EligibilityHeader, EligibilitySectionWrapper } from "./App.components";
import { BreadcrumbStatus } from "./Common/BreadcrumbStatus";
import { SidebarPage } from "./Layouts/SidebarPage";

export const Claim: React.FC = () => {
  const location = useLocation();
  const { pathname } = location;
  const path = pathname.split("/").pop();

  return (
    <SidebarPage>
      <EligibilityHeader>
        <Stack gap={6} direction="horizontal">
          <BreadcrumbStatus active={path === "info"} accepted={true}>
            Eligibility
          </BreadcrumbStatus>
          <BreadcrumbStatus active={path === "confirmation"}>
            Claim
          </BreadcrumbStatus>
        </Stack>
      </EligibilityHeader>
      <EligibilitySectionWrapper>
        <Outlet />
      </EligibilitySectionWrapper>
    </SidebarPage>
  );
};
