import { Heading, Stack } from "@namada/components";
import { useAtom } from "jotai";
import { AnotherWays } from "./AnotherWays";
import { EligibilityHeader, EligibilitySectionWrapper } from "./App.components";
import { WalletAddress } from "./Common/WalletAddress";
import { NonEligibleIcon } from "./Icons/NonEligibleIcon";
import { SidebarPage } from "./Layouts/SidebarPage";
import { NonEligiblePanel } from "./NonEligible.components";
import { labelAtom } from "./state";
import { labelTextMap } from "./utils";
import { BreadcrumbStatus } from "./Common/BreadcrumbStatus";

export const NonEligible: React.FC = () => {
  const [label] = useAtom(labelAtom);

  return (
    <SidebarPage>
      <EligibilityHeader>
        <Stack gap={6} direction="horizontal">
          <BreadcrumbStatus active={true} rejected={true}>
            Eligibility
          </BreadcrumbStatus>
          <BreadcrumbStatus active={false}>Claim</BreadcrumbStatus>
        </Stack>
      </EligibilityHeader>
      <EligibilitySectionWrapper>
        <NonEligiblePanel>
          <NonEligibleIcon />
          <article>
            <Stack gap={2} as="header">
              <Heading themeColor="primary" level="h1" size="5xl">
                Account is <strong>not</strong> eligible
              </Heading>
              <p>Sorry you are not eligible for the RPGF Drop</p>
            </Stack>
            <hr />
            {label && (
              <>
                <div>{labelTextMap[label.type]}</div>
                <WalletAddress>{label.value}</WalletAddress>
              </>
            )}
          </article>
        </NonEligiblePanel>
        <AnotherWays />
      </EligibilitySectionWrapper>
    </SidebarPage>
  );
};
