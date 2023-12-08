import { Window as KeplrWindow } from "@keplr-wallet/types";
import { Heading } from "@namada/components";
import { useEffect, useState } from "react";
import { AnotherWaysButtons, AnotherWaysContainer } from "./App.components";
import { CosmosButton } from "./Buttons/CosmosButton";
import { DownloadKeplr } from "./Buttons/DownloadKeplr";
import { DownloadMetamask } from "./Buttons/DownloadMetamask";
import { GithubButton } from "./Buttons/GithubButton";
import { MetamaskButton } from "./Buttons/MetamaskButton";
import { OsmosisButton } from "./Buttons/OsmosisButton";
import { StargazerButton } from "./Buttons/StargazerButton";
import { TrustedSetupButton } from "./Buttons/TrustedSetupButton";
import { AcceptTermsCheckbox } from "./Common/AcceptTermsCheckbox";
import { getMetamask } from "./utils";

type AnotherWaysProps = {
  title: string;
  className?: string;
  reset?: boolean;
};

export const AnotherWays: React.FC<AnotherWaysProps> = (props) => {
  const [isTOSAccepted, setIsTOSAccepted] = useState(false);
  const keplr = (window as KeplrWindow)?.keplr;
  const metamask = getMetamask();
  const columns = !metamask && !keplr ? "1fr 1fr" : "1fr 1fr 1fr";

  useEffect(() => {
    if (typeof props.reset === "boolean") {
      setIsTOSAccepted(false);
    }
  }, [props.reset]);

  return (
    <AnotherWaysContainer className={props.className}>
      <Heading themeColor="primary" level={"h2"} size={"2xl"}>
        {props.title}
      </Heading>
      <AnotherWaysButtons columns={columns}>
        <GithubButton disabled={!isTOSAccepted} />
        {metamask && <MetamaskButton disabled={!isTOSAccepted} />}
        <TrustedSetupButton disabled={!isTOSAccepted} />
        {keplr && (
          <>
            <CosmosButton disabled={!isTOSAccepted} />
            <OsmosisButton disabled={!isTOSAccepted} />
            <StargazerButton disabled={!isTOSAccepted} />
          </>
        )}
        {!metamask && <DownloadMetamask disabled={!isTOSAccepted} />}
        {!keplr && <DownloadKeplr disabled={!isTOSAccepted} />}
      </AnotherWaysButtons>

      <AcceptTermsCheckbox
        checked={isTOSAccepted}
        onChange={() => setIsTOSAccepted(!isTOSAccepted)}
      />
    </AnotherWaysContainer>
  );
};
