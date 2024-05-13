import { ActionButton, TableRow } from "@namada/components";
import { formatPercentage, shortenAddress } from "@namada/utils";
import FiatCurrency from "App/Common/FiatCurrency";
import NamCurrency from "App/Common/NamCurrency";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";
import { useNavigate } from "react-router-dom";
import { MyValidator, Validator, myValidatorsAtom } from "slices/validators";
import ValidatorsTable from "./ValidatorsTable";
import StakingRoutes from "./routes";

export const MyValidatorsTable = (): JSX.Element => {
  const navigate = useNavigate();
  const myValidators = useAtomValue(myValidatorsAtom);
  const myValidatorsObj: Record<string, MyValidator> =
    myValidators.isSuccess ?
      myValidators.data.reduce(
        (acc: Record<string, MyValidator>, current: MyValidator) => {
          return { ...acc, [current.validator.address]: current };
        },
        {}
      )
    : {};

  const head = [
    "",
    "My Validators",
    "Address",
    <div key="my-validators-vp" className="text-right">
      Voting Power
    </div>,
    <div key="my-validators-staked-amount" className="text-right">
      Staked Amount
    </div>,
    <div key="my-validators-comission" className="text-right">
      Comission
    </div>,
  ];

  const renderRow = (validator: Validator): TableRow => {
    const stakedAmount = myValidatorsObj[validator.address].stakedAmount;
    return {
      className: "",
      cells: [
        <img
          key={`validator-image-${validator.uuid}`}
          src={validator.imageUrl}
          className="rounded-full aspect-square max-w-8"
        />,
        validator.alias,
        shortenAddress(validator.address, 8, 6),
        <div
          className="flex flex-col text-right leading-tight"
          key={`validator-voting-power-${validator.uuid}`}
        >
          {validator.votingPowerInNAM && (
            <span>{validator.votingPowerInNAM?.toString()} NAM</span>
          )}
          <span className="text-neutral-600 text-sm">
            {formatPercentage(BigNumber(validator.votingPowerPercentage || 0))}
          </span>
        </div>,
        <div
          key={`currency-${validator.uuid}`}
          className="text-right leading-tight"
        >
          <NamCurrency amount={stakedAmount || new BigNumber(0)} />
          <FiatCurrency
            amountInNam={stakedAmount || new BigNumber(0)}
            className="block text-sm text-neutral-600"
          />
        </div>,
        <div
          key={`comission-${validator.uuid}`}
          className="text-right leading-tight"
        >
          {formatPercentage(validator.commission)}
        </div>,
      ],
    };
  };

  return (
    <>
      <nav className="absolute top-6 right-4 flex gap-2 flex-1 z-50">
        <ActionButton
          className="basis-[content] py-1"
          color="primary"
          size="md"
          borderRadius="sm"
          onClick={() => navigate(StakingRoutes.incrementBonding().url)}
        >
          Stake
        </ActionButton>
        <ActionButton
          className="basis-[content] py-1"
          color="white"
          size="md"
          borderRadius="sm"
          onClick={() => navigate(StakingRoutes.redelegateBonding().url)}
        >
          Re-delegate
        </ActionButton>
        <ActionButton
          className="basis-[content] py-1"
          color="white"
          size="md"
          outlined
          borderRadius="sm"
          onClick={() => navigate(StakingRoutes.unstake().url)}
        >
          Unstake
        </ActionButton>
      </nav>
      <ValidatorsTable
        id="my-validators"
        tableClassName="mt-2"
        validatorList={
          myValidators.isSuccess ?
            myValidators.data.map((v: MyValidator) => v.validator)
          : []
        }
        headers={head}
        renderRow={renderRow}
      />
    </>
  );
};
