import { useUntilIntegrationAttached } from "@namada/integrations";
import { Chain } from "@namada/types";
import clsx from "clsx";
import { AccountsState } from "slices/accounts";
import { useAppSelector } from "store";

import { ActionButton, Currency, Heading, Stack } from "@namada/components";
import { Intro } from "App/Common/Intro";
import MainnetRoadmap from "App/Sidebars/MainnetRoadmap";

//TODO: move to utils when we have one
const isEmptyObject = (object: Record<string, unknown>): boolean => {
  return object ? Object.keys(object).length === 0 : true;
};

export const AccountOverview = (): JSX.Element => {
  const chain = useAppSelector<Chain>((state) => state.chain.config);

  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);

  const extensionAttachStatus = useUntilIntegrationAttached(chain);
  const currentExtensionAttachStatus =
    extensionAttachStatus[chain.extension.id];

  const hasExtensionInstalled =
    currentExtensionAttachStatus === "attached" ||
    currentExtensionAttachStatus === "pending";

  const isConnected = !isEmptyObject(derived[chain.id]);

  return (
    <Stack gap={4} direction="horizontal" className="w-full">
      <div className="flex items-center bg-black rounded-sm w-full">
        {!isConnected && (
          <div className="w-[420px] mx-auto">
            <Intro
              chain={chain}
              hasExtensionInstalled={hasExtensionInstalled}
            />
          </div>
        )}
        {isConnected && (
          <Stack gap={5} className="my-auto min-w-[365px] mx-auto">
            <div
              className={clsx(
                "relative flex flex-col leading-tight w-full aspect-square rounded-full border-[27px] border-yellow",
                "items-center justify-center text-center text-neutral-400"
              )}
            >
              <Heading level="h3" className="text-xl neutral-600">
                NAM Balance
              </Heading>
              <Currency
                amount={354.45}
                currency="nam"
                currencyPosition="right"
                className="text-5xl text-white font-medium"
                currencySignClassName="text-xl ml-2"
              />
              <Currency
                className="text-xl font-medium"
                amount={21.34}
                currency="usd"
              />
            </div>
            <footer className="text-center">
              <Heading
                level="h3"
                className="uppercase text-4xl text-yellow mb-2"
              >
                Stake & Vote Now
              </Heading>
              <Stack gap={3} direction="horizontal">
                <ActionButton
                  size="sm"
                  color="primary"
                  className="uppercase"
                  borderRadius="sm"
                >
                  Stake
                </ActionButton>
                <ActionButton
                  size="sm"
                  color="primary"
                  outlined
                  className="uppercase"
                  borderRadius="sm"
                >
                  Governance
                </ActionButton>
              </Stack>
            </footer>
          </Stack>
        )}
      </div>
      {isConnected && (
        <aside className="bg-black rounded-sm">
          <MainnetRoadmap />
        </aside>
      )}
    </Stack>
  );
};
