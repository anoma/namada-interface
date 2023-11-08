import {
  Button,
  ButtonVariant,
  Heading,
  HeadingLevel,
} from "@namada/components";
import { AddressText, NamadaSection, TextButton } from "./App.components";
import { useIntegrationConnection } from "@namada/hooks";
import { Action } from "./state";

const { REACT_APP_NAMADA_CHAIN_ID: namadaChainId = "namadaChainId" } =
  process.env;

type Props = {
  dispatch: React.Dispatch<Action>;
  address: string;
};

export const NamadaAddress: React.FC<Props> = ({
  dispatch,
  address,
}: Props) => {
  // TODO: change const to state
  const namadaAttachStatus = "attached";

  const [namada, _, withNamadaConnection] =
    useIntegrationConnection(namadaChainId);

  const handleNamadaConnection = async (): Promise<void> => {
    withNamadaConnection(async () => {
      const accounts = await namada?.accounts();
      if (accounts && accounts.length > 0) {
        const address = accounts[0].address;
        dispatch({ type: "set_namada_address", payload: address });
        localStorage.setItem("namada_address", address);
      }
    });
  };

  const handleDownloadExtension = (url: string): void => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <NamadaSection>
      <Heading level={HeadingLevel.Two}>1. Get your Namada address</Heading>
      {!address && (
        <Button
          variant={ButtonVariant.Contained}
          onClick={
            namadaAttachStatus === "attached"
              ? handleNamadaConnection
              : handleDownloadExtension.bind(null, "https://namada.me")
          }
        >
          {["attached", "pending"].includes(namadaAttachStatus)
            ? "Connect to Namada"
            : "Click to download the Namada extension"}
        </Button>
      )}
      {address && (
        <>
          <Heading level={HeadingLevel.Three}>Address:</Heading>
          <AddressText>{address}</AddressText>
          <AddressText>
            <b>NOTE:</b> Please review if the address is correct. Otherwise
            change the address in the extension and
            <TextButton
              onClick={() => {
                localStorage.removeItem("namada_address");
                handleNamadaConnection();
              }}
            >
              {" "}
              CLICK HERE TO RESET.
            </TextButton>
          </AddressText>
        </>
      )}
    </NamadaSection>
  );
};
