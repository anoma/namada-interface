import { ActionButton, Image, Panel } from "@namada/components";
import { applicationFeaturesAtom } from "atoms/settings";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { RoadmapPhase } from "./RoadmapPhase";

const MainnetRoadmap = (): JSX.Element => {
  const {
    claimRewardsEnabled,
    shieldingRewardsEnabled,
    namTransfersEnabled,
    maspEnabled,
    ibcTransfersEnabled,
  } = useAtomValue(applicationFeaturesAtom);

  const getClassName = (enabled: boolean): string =>
    clsx(!enabled && "opacity-25");

  return (
    <Panel>
      <div className="flex flex-col items-center max-w-[240px] py-5 mx-auto">
        <Image styleOverrides={{ width: "50px" }} imageName="LogoMinimal" />
        <h2 className="text-yellow text-center uppercase text-xl leading-6 font-medium mt-2.5">
          Namada Mainnet Roadmap
        </h2>
        <ul>
          <RoadmapPhase phase="1" active={true}>
            <>
              Proof of Stake
              <br />
              Governance
            </>
          </RoadmapPhase>
          <RoadmapPhase phase="2" active={claimRewardsEnabled}>
            <span className={getClassName(claimRewardsEnabled)}>
              Staking Rewards
            </span>
          </RoadmapPhase>
          <RoadmapPhase phase="3" active={ibcTransfersEnabled || maspEnabled}>
            <>
              <span className={getClassName(ibcTransfersEnabled)}>
                IBC Transfers
              </span>
              <br />
              <span className={getClassName(maspEnabled)}>MASP Enabled</span>
            </>
          </RoadmapPhase>
          <RoadmapPhase phase="4" active={shieldingRewardsEnabled}>
            <span className={getClassName(shieldingRewardsEnabled)}>
              Shielding Rewards
            </span>
          </RoadmapPhase>
          <RoadmapPhase phase="5" active={namTransfersEnabled}>
            <span className={getClassName(namTransfersEnabled)}>
              NAM Transfers enabled
            </span>
          </RoadmapPhase>
        </ul>
        <ActionButton
          className="max-w-40 mt-6"
          href="https://namada.net/mainnet-launch"
          target="_blank"
          backgroundColor="transparent"
          backgroundHoverColor="yellow"
          outlineColor="yellow"
          size="sm"
        >
          Learn about Mainnet phases
        </ActionButton>
      </div>
    </Panel>
  );
};

export default MainnetRoadmap;
