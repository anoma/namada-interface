import { ActionButton, Image } from "@namada/components";
import { applicationFeaturesAtom } from "atoms/settings";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { FaCircleCheck } from "react-icons/fa6";

const MainnetRoadmap = (): JSX.Element => {
  const { claimRewardsEnabled } = useAtomValue(applicationFeaturesAtom);

  const renderPhase = (
    phaseNumber: string,
    name: React.ReactNode,
    className: string,
    done = false
  ): JSX.Element => {
    return (
      <li
        className={clsx(
          "flex flex-col items-center text-center uppercase text-yellow my-2",
          className
        )}
      >
        <i className="w-0.5 h-3.5 bg-yellow mb-1.5" />
        <span className="block text-[13px] mb-1">Phase {phaseNumber}</span>
        <span className="leading-normal">{name}</span>
        {done && (
          <i className="my-1">
            <FaCircleCheck />
          </i>
        )}
      </li>
    );
  };

  return (
    <div className="flex flex-col items-center w-[240px] py-10 px-6 mx-auto">
      <Image styleOverrides={{ width: "50px" }} imageName="LogoMinimal" />
      <h2 className="text-yellow text-center uppercase text-xl leading-6 font-medium mt-2.5">
        Namada Mainnet Roadmap
      </h2>
      <ul>
        {renderPhase(
          "1",
          <>
            Proof of Stake
            <br />
            Governance
          </>,
          "opacity-100",
          true
        )}
        {renderPhase(
          "2",
          <>Staking Rewards</>,
          claimRewardsEnabled ? "opacity-100" : "opacity-25",
          claimRewardsEnabled
        )}
        {renderPhase("2", <></>, "opacity-25")}
        {renderPhase(
          "3",
          <>
            IBC Transfers
            <br />
            MASP Enabled
          </>,
          "opacity-25"
        )}
        {renderPhase("4", "Shielding Rewards", "opacity-25")}
        {renderPhase("5", "NAM Transfers enabled", "opacity-25")}
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
  );
};

export default MainnetRoadmap;
