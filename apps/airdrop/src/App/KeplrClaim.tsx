import {
  Button,
  ButtonVariant,
  Heading,
  HeadingLevel,
} from "@namada/components";
import {
  Claim,
  ClaimLabel,
  ClaimValue,
  EligibilityInfo,
} from "./App.components";
import { useState } from "react";
import { useIntegrationConnection } from "@namada/hooks";
import { ClaimResponse } from "./types";

type KeplrClaim = {
  eligible: boolean;
  amount: number;
  has_claimed: boolean;
};

const { REACT_APP_COSMOS_CHAIN_ID: cosmosChainId = "cosmosChainId" } =
  process.env;

//TODO: replace cosmos with argument: either cosmos or osmosis
const checkClaim = async (address: string): Promise<KeplrClaim> => {
  const response = await fetch(
    `http://localhost:5000/api/v1/airdrop/cosmos/${address}`,
    {
      method: "GET",
    }
  );
  return response.json();
};

type ClaimRequestBody = {
  signer_address: string;
  signer_public_key: string;
  signer_public_key_type: string;
  signature: string;
  airdrop_address: string;
};

const claimWithKeplr = async (
  body: ClaimRequestBody
): Promise<ClaimResponse> => {
  const response = await fetch("http://localhost:5000/api/v1/airdrop/cosmos", {
    method: "POST",
    headers: new Headers({ "content-type": "application/json" }),
    body: JSON.stringify(body),
  });

  return response.json();
};

type Props = { namadaAddress: string };

export const KeplrClaim: React.FC<Props> = ({ namadaAddress }: Props) => {
  const [claimInfo, setClaimInfo] = useState<KeplrClaim | null>(null);
  const [address, setAddress] = useState("");

  //TODO: replace with state
  const keplrAttachStatus = "attached";

  const [keplr, _isConnectingToKeplr, withKeplrConnection] =
    useIntegrationConnection(cosmosChainId);

  const handleKeplrConnection = async (): Promise<void> => {
    withKeplrConnection(async () => {
      const accounts = await keplr?.accounts();
      if (accounts && accounts.length > 0) {
        const address = accounts[0].address;
        const cosmosClaim = await checkClaim(address);
        setClaimInfo(cosmosClaim);
        setAddress(address);
      }
    });
  };

  const handleDownloadExtension = (url: string): void => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Claim>
      {!claimInfo && (
        <Button
          variant={ButtonVariant.Contained}
          onClick={
            keplrAttachStatus === "attached"
              ? handleKeplrConnection
              : handleDownloadExtension.bind(null, "https://www.keplr.app/")
          }
        >
          {["attached", "pending"].includes(keplrAttachStatus)
            ? "With cosmos"
            : "Click to download the Keplr extension"}
        </Button>
      )}

      {claimInfo && (
        <>
          <Heading level={HeadingLevel.Three}>With cosmos:</Heading>
          <EligibilityInfo>
            <ClaimLabel>Eligible: </ClaimLabel>
            <ClaimValue>{claimInfo.eligible ? "Yes" : "No"}</ClaimValue>
            <ClaimLabel>Amount: </ClaimLabel>
            <ClaimValue>{claimInfo.amount} NAM</ClaimValue>
          </EligibilityInfo>
        </>
      )}

      {address && claimInfo && claimInfo.eligible && !claimInfo.has_claimed && (
        <Button
          variant={ButtonVariant.Contained}
          onClick={async () => {
            const signature = await keplr?.signArbitrary(
              "cosmoshub-4",
              address,
              namadaAddress
            );
            const { confirmed } = await claimWithKeplr({
              signer_address: address,
              signer_public_key: signature.pub_key.value,
              signer_public_key_type: signature.pub_key.type,
              signature: signature.signature,
              airdrop_address: namadaAddress,
            });
            setClaimInfo({
              ...claimInfo,
              has_claimed: confirmed,
            });
          }}
        >
          Claim
        </Button>
      )}
      {claimInfo?.has_claimed && <ClaimLabel>Claimed</ClaimLabel>}
    </Claim>
  );
};
