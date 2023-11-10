import { Outlet, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  EligibilityContainer,
  EligibilitySectionWrapper,
  GithubBreadcrumb,
  GithubFooter,
  GithubHeader,
} from "./App.components";

export const Claim: React.FC = () => {
  const location = useLocation();
  const { pathname } = location;
  const path = pathname.split("/").pop();

  return (
    <EligibilityContainer>
      <GithubHeader>
        <GithubBreadcrumb>
          <Breadcrumb className={path === "info" ? "active" : ""}>
            1. Eligibility
          </Breadcrumb>
          <Breadcrumb className={path === "confirmation" ? "active" : ""}>
            2. Claim
          </Breadcrumb>
        </GithubBreadcrumb>
      </GithubHeader>
      <EligibilitySectionWrapper>
        <Outlet />
      </EligibilitySectionWrapper>
      <GithubFooter></GithubFooter>
    </EligibilityContainer>
  );
};
