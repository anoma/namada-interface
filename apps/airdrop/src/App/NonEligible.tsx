import { Heading, Stack } from "@namada/components";
import { useAtom } from "jotai";
import { EligibilityHeader, EligibilitySectionWrapper } from "./App.components";
import { WalletAddress } from "./Common/WalletAddress";
import { NonEligibleIcon } from "./Icons/NonEligibleIcon";
import { SidebarPage } from "./Layouts/SidebarPage";
import {
  NonEligibleAnotherWays,
  NonEligiblePanel,
} from "./NonEligible.components";
import { labelAtom } from "./state";
import { labelTextMap } from "./utils";
import { BreadcrumbStatus } from "./Common/BreadcrumbStatus";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap, { Bounce } from "gsap";

export const NonEligible: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);

  const [label] = useAtom(labelAtom);
  const [TOSReset, setTOSReset] = useState(false);

  useLayoutEffect(() => {
    gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo(
        "svg",
        { scale: 0 },
        { scale: 1, ease: Bounce.easeOut, duration: 0.5 }
      );

      tl.fromTo("article", { opacity: 0 }, { opacity: 1 }, "-=0.25");
    }, [contentRef]);
  }, [label]);

  useEffect(() => {
    setTOSReset(!TOSReset);
    window.scrollTo(0, 0);
  }, [label]);

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
      <EligibilitySectionWrapper ref={contentRef}>
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
                <WalletAddress value={label.value} />
              </>
            )}
          </article>
        </NonEligiblePanel>
        <NonEligibleAnotherWays reset={TOSReset} title="Try another way" />
      </EligibilitySectionWrapper>
    </SidebarPage>
  );
};
