import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { AccountsState, fetchBalanceByAccount } from "slices/accounts";
import { useAppDispatch, useAppSelector } from "store";

import { Input, InputVariants } from "components/Input";
import { isMemoValid, MAX_MEMO_LENGTH } from "../TokenSend/TokenSendForm";
import { InputContainer } from "../TokenSend/TokenSendForm.components";
import { IBCTransferFormContainer } from "./IBCTransfer.components";
import { Select } from "components/Select";

import Config from "config";

type UrlParams = {
  id: string;
};

const IBCTransfer = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const { id = "" } = useParams<UrlParams>();
  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);

  const [amount, setAmount] = useState(0);
  const [memo, setMemo] = useState("");
  const [selectedChain, setSelectedChain] = useState("");

  const account = derived[id] || {};
  const { balance = 0 } = account;

  const handleFocus = (e: React.ChangeEvent<HTMLInputElement>): void =>
    e.target.select();

  const { chain } = Config;

  const chains = Object.values(chain);
  const selectChainData = chains.map(({ id, name }) => ({
    value: id,
    label: name,
  }));

  useEffect(() => {
    if (account) {
      // fetch latest balance
      dispatch(fetchBalanceByAccount(account));
    }
  }, [account]);

  return (
    <IBCTransferFormContainer>
      <InputContainer>
        <Select<string>
          data={selectChainData}
          value={selectedChain}
          label="Destination Chain"
          onChange={(e) => setSelectedChain(e.target.value)}
        />
      </InputContainer>
      <InputContainer>
        <Input
          variant={InputVariants.Number}
          label="Amount"
          value={amount}
          onChangeCallback={(e) => {
            const { value } = e.target;
            setAmount(parseFloat(`${value}`));
          }}
          onFocus={handleFocus}
          error={amount <= balance ? undefined : "Invalid amount!"}
        />
      </InputContainer>

      <InputContainer>
        <Input
          variant={InputVariants.Textarea}
          label="Memo (Optional)"
          value={memo}
          error={
            isMemoValid(memo)
              ? ""
              : `Must be less than ${MAX_MEMO_LENGTH} characters`
          }
          onChangeCallback={(e) => setMemo(e.target.value)}
        />
      </InputContainer>
    </IBCTransferFormContainer>
  );
};

export default IBCTransfer;
