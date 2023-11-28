import React from "react";
import { FaqContainer, FaqUrl } from "./Faq.components";
import { Text } from "@namada/components";
import { FaqDropdown } from "./FaqDropdown";

const namadaDiscord = "https://discord.com/invite/namada";
const becomeValidatorUrl =
  "https://docs.namada.net/operators/validators/post-genesis-validator-setup";

export const Faq: React.FC = () => {
  return (
    <FaqContainer>
      <Text fontSize="5xl" themeColor="utility1">
        FAQs
      </Text>
      <FaqDropdown title="How do I use this?">
        <Text themeColor="utility1" fontSize="base">
          To request funds, simply enter your wallet address and hit “Get
          Testnet Tokens”.
          <div style={{ marginTop: "16px" }}>
            See the{" "}
            <FaqUrl href={becomeValidatorUrl}>
              {'"Generating a validator account"'}
            </FaqUrl>{" "}
            section if you need to create a new address.
          </div>
        </Text>
      </FaqDropdown>
      <FaqDropdown title="How can I use these tokens?">
        <Text themeColor="utility1" fontSize="base">
          These are test coins on a test network and do not have any real value
          for regular users. They are designed for developers to test and
          develop their applications without using real money. Please note that
          these test coins are not transferable to the main network and cannot
          be exchanged for real money or other cryptocurrencies.
        </Text>
      </FaqDropdown>
      <FaqDropdown title="The faucet confirmed that it sent me tokens, but I still have not received them">
        <Text themeColor="utility1" fontSize="base">
          The time required to receive test tokens may vary. It depends on the
          speed of the blocks in the current chain.
          <div style={{ marginTop: "16px" }}>
            If more than a few hours have passed and you still have not received
            your tokens, please email us at{" "}
            <FaqUrl href={namadaDiscord}>{"Discord!"}</FaqUrl>
          </div>
        </Text>
      </FaqDropdown>
      <FaqDropdown title="What if the faucet doesn't work?">
        <Text themeColor="utility1" fontSize="base">
          <FaqUrl href={namadaDiscord}>{"Join our Discord"}</FaqUrl> to share
          any issues or questions you have relating to the faucet. We will
          definitely help!
        </Text>
      </FaqDropdown>
    </FaqContainer>
  );
};
