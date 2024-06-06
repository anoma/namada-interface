import {
  ActionButton,
  Heading,
  SkeletonLoading,
  Stack,
} from "@namada/components";
import { useUntilIntegrationAttached } from "@namada/integrations";
import { FiatCurrency } from "App/Common/FiatCurrency";
import { Intro } from "App/Common/Intro";
import { NamCurrency } from "App/Common/NamCurrency";
import { PageWithSidebar } from "App/Common/PageWithSidebar";
import GovernanceRoutes from "App/Governance/routes";
import MainnetRoadmap from "App/Sidebars/MainnetRoadmap";
import StakingRoutes from "App/Staking/routes";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { useNavigate } from "react-router-dom";
import { accountBalanceAtom, defaultAccountAtom } from "slices/accounts";
import { chainAtom } from "slices/chain";

export const AccountOverview = (): JSX.Element => {
  const navigate = useNavigate();
  const chain = useAtomValue(chainAtom);
  const extensionAttachStatus = useUntilIntegrationAttached(chain);
  const currentExtensionAttachStatus =
    extensionAttachStatus[chain.extension.id];

  const { data: account } = useAtomValue(defaultAccountAtom);
  const {
    data: totalBalance,
    isSuccess: balanceHasLoaded,
    isLoading: balanceIsLoading,
  } = useAtomValue(accountBalanceAtom);

  const hasExtensionInstalled =
    currentExtensionAttachStatus === "attached" ||
    currentExtensionAttachStatus === "pending";

  const isConnected = account !== undefined;
  const fullWidthClassName = clsx({ "col-span-2": !isConnected });

  return (
    <PageWithSidebar footerClassName={fullWidthClassName}>
      <div
        className={clsx(
          "flex items-center bg-rblack rounded-sm w-full",
          fullWidthClassName
        )}
      >
        {!isConnected && (
          <div className="w-[420px] mx-auto">
            <Intro
              chain={chain}
              hasExtensionInstalled={hasExtensionInstalled}
            />
          </div>
        )}

        {isConnected && (
          <Stack gap={5} className="my-auto min-w-[365px] mx-auto py-12">
            {balanceHasLoaded && totalBalance && (
              <div
                className={clsx(
                  "relative flex flex-col leading-tight w-full aspect-square rounded-full border-[27px] border-yellow",
                  "items-center justify-center text-center text-neutral-400"
                )}
              >
                <Heading level="h3" className="text-xl neutral-600">
                  NAM Balance
                </Heading>
                <NamCurrency
                  amount={totalBalance}
                  className="text-5xl text-white font-medium"
                  currencySignClassName="text-xl ml-2"
                />
                <FiatCurrency
                  amountInNam={totalBalance}
                  className="text-xl font-medium"
                />
              </div>
            )}
            {balanceIsLoading && (
              <SkeletonLoading
                width="100%"
                height="auto"
                className="aspect-square mx-auto rounded-full bg-transparent border-[27px] border-neutral-800"
              />
            )}
            <footer className="text-center">
              <Heading
                level="h3"
                className="uppercase text-4xl text-yellow mb-2"
              >
                Stake & Vote Now
              </Heading>
              <Stack gap={3} direction="horizontal">
                <ActionButton
                  className="border-yellow border uppercase"
                  onClick={() => navigate(StakingRoutes.overview().url)}
                  size="sm"
                  color="primary"
                  borderRadius="sm"
                >
                  Stake
                </ActionButton>
                <ActionButton
                  size="sm"
                  onClick={() => navigate(GovernanceRoutes.index())}
                  color="primary"
                  outlined
                  className="uppercase hover:text-rblack before:border before:border-yellow"
                  borderRadius="sm"
                  hoverColor="primary"
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
    </PageWithSidebar>
  );
};
