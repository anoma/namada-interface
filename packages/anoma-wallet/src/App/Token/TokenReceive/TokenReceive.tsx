import { Heading, HeadingLevel } from "components/Heading";
import { NavigationContainer } from "components/NavigationContainer";
import { useNavigate, useParams } from "react-router-dom";
import { DerivedAccountsState } from "slices/accounts";
import { useAppSelector } from "store";
import { TokenReceiveContainer } from "./TokenReceive.components";

type TokenSendParams = {
  hash: string;
};

const TokenSend = (): JSX.Element => {
  const navigate = useNavigate();
  const { hash = "" } = useParams<TokenSendParams>();
  const { derived } = useAppSelector<DerivedAccountsState>(
    (state) => state.accounts
  );
  const account = derived[hash];

  console.log({ hash, account });
  return (
    <TokenReceiveContainer>
      <NavigationContainer
        onBackButtonClick={() => {
          navigate(-1);
        }}
      >
        <Heading level={HeadingLevel.One}>Token Send</Heading>
      </NavigationContainer>
    </TokenReceiveContainer>
  );
};

export default TokenSend;
