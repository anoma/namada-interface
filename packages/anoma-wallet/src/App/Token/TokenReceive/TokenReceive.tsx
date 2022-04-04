import { Heading, HeadingLevel } from "components/Heading";
import { NavigationContainer } from "components/NavigationContainer";
import { useNavigate, useParams } from "react-router-dom";
import { DerivedAccountsState } from "slices/accounts";
import { useAppSelector } from "store";
import { TokenReceiveContainer } from "./TokenReceive.components";

type TokenReceiveParams = {
  hash: string;
};

const TokenReceive = (): JSX.Element => {
  const navigate = useNavigate();
  const { hash = "" } = useParams<TokenReceiveParams>();
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
        <Heading level={HeadingLevel.One}>Token Receive</Heading>
      </NavigationContainer>
    </TokenReceiveContainer>
  );
};

export default TokenReceive;
