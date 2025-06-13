import { Panel } from "@namada/components";
import { AssetImage } from "App/Transfer/AssetImage";
import { chainParametersAtom, maspRewardsAtom } from "atoms/chain";
import { simulateShieldedRewards } from "atoms/staking/services";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { useIsChannelInactive } from "hooks/useIsChannelInactive";
import { useAtomValue } from "jotai";
import { debounce } from "lodash";
import { useEffect, useRef, useState } from "react";
import { GoChevronDown } from "react-icons/go";
import { MaspAssetRewards } from "types";
import { toBaseAmount } from "utils";

const RewardItem = ({
  reward,
  onSelect,
}: {
  reward: MaspAssetRewards;
  onSelect: (asset: MaspAssetRewards) => void;
}): JSX.Element => {
  const { isInactive, trace } = useIsChannelInactive(reward.address ?? "");

  return (
    <button
      key={reward.asset.base}
      type="button"
      onClick={() => onSelect(reward)}
      className={clsx(
        "w-full flex items-center py-1.5 px-1 text-left",
        "transition-colors"
      )}
    >
      <div
        className={clsx(
          "px-2 py-1 gap-4 hover:bg-neutral-800 rounded-sm ml-2 flex w-full relative",
          isInactive && "opacity-20"
        )}
      >
        <div className="w-8 h-8 flex-shrink-0 ">
          <AssetImage asset={reward.asset} />
        </div>
        <div
          className={clsx(
            "flex flex-col gap-1 min-w-0",
            isInactive && "-mt-1.5"
          )}
        >
          <div className="text-white font-medium text-sm mt-1.5">
            {reward.asset.symbol}
          </div>
          {isInactive && (
            <div className="-mt-1 text-[10px]">inactive: {trace}</div>
          )}
        </div>
      </div>
    </button>
  );
};

export const MaspRewardCalculator = (): JSX.Element => {
  const rewards = useAtomValue(maspRewardsAtom);
  const [amount, setAmount] = useState<string>("10");
  const [selectedAsset, setSelectedAsset] = useState<
    MaspAssetRewards | undefined
  >(rewards.data?.[0] || undefined);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [calculatedRewards, setCalculatedRewards] = useState<string>("0.00");
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const chainParameters = useAtomValue(chainParametersAtom);
  const chainId = chainParameters.data?.chainId;

  // Set initial selected asset when rewards data loads
  useEffect(() => {
    if (rewards.data && rewards.data.length > 0 && !selectedAsset) {
      setSelectedAsset(rewards.data[0]);
    }
  }, [rewards.data, selectedAsset]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const debouncedFetchRewards = debounce(async (): Promise<void> => {
      if (!selectedAsset || !amount || !chainId || !selectedAsset.address)
        return;

      setIsCalculating(true);
      try {
        const rewardsResult = await simulateShieldedRewards(
          chainId,
          selectedAsset.address,
          toBaseAmount(selectedAsset.asset, new BigNumber(amount)).toString()
        );
        setCalculatedRewards(rewardsResult);
      } catch (error) {
        console.error("Error calculating rewards:", error);
        setCalculatedRewards("0.00");
      } finally {
        setIsCalculating(false);
      }
    }, 300);

    debouncedFetchRewards();

    return () => {
      debouncedFetchRewards.cancel();
    };
  }, [selectedAsset, amount]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isDropdownOpen]);

  const handleAssetSelect = (asset: MaspAssetRewards): void => {
    setSelectedAsset(asset);
    setIsDropdownOpen(false);
    setSearchTerm("");
  };

  // Filter assets based on search term
  const filteredRewards =
    rewards.data?.filter((reward) =>
      reward.asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <Panel className={clsx("flex flex-col pt-0 pb-2 px-0")}>
      <div className="mt-3 flex flex-col gap-3">
        {rewards.isLoading && (
          <i
            className={clsx(
              "absolute w-8 h-8 top-0 left-0 right-0 bottom-0 m-auto border-4",
              "border-transparent border-t-yellow rounded-[50%]",
              "animate-loadingSpinner"
            )}
          />
        )}
        {rewards.data && (
          <>
            <div className="flex gap-0 py-1 bg-neutral-800 rounded-md relative">
              <div className="flex-shrink-0" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={clsx(
                    "flex items-center gap-1 px-3 py-3 text-white",
                    "hover:bg-neutral-800 transition-colors rounded-l-sm",
                    "min-w-[80px]"
                  )}
                >
                  <div className="w-6 h-6 flex-shrink-0">
                    <AssetImage asset={selectedAsset?.asset} />
                  </div>
                  <span className="text-sm font-medium">
                    {selectedAsset?.asset.symbol || "Select"}
                  </span>
                  <GoChevronDown
                    className={clsx(
                      "ml-1 transition-transform text-neutral-400 text-xs",
                      isDropdownOpen && "rotate-180"
                    )}
                  />
                </button>
                {isDropdownOpen && (
                  <div
                    className={clsx(
                      "absolute top-full left-0 w-full z-50 mt-1",
                      "bg-neutral-900 rounded-sm  border border-neutral-600",
                      "max-h-[300px] overflow-hidden",
                      "z=[9999]"
                    )}
                    style={{ zIndex: 9999 }}
                  >
                    <div className="border-none">
                      <div className="relative">
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search"
                          className={clsx(
                            "w-full pl-4 pr-3 py-2 bg-black text-white",
                            "border-b border-neutral-600 text-sm",
                            "focus:outline-none focus:border-neutral-500"
                          )}
                        />
                      </div>
                    </div>

                    <div className="max-h-[200px] overflow-y-auto dark-scrollbar overscroll-contain">
                      {filteredRewards.length === 0 ?
                        <div className="p-3 text-center text-neutral-400 text-sm">
                          No assets found
                        </div>
                      : filteredRewards.map((reward, idx) => (
                          <RewardItem
                            key={reward.asset.base + "_" + idx}
                            reward={reward}
                            onSelect={handleAssetSelect}
                          />
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>

              <input
                type="number"
                min="0"
                value={amount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (Number(value) === 0) setCalculatedRewards("0.00");
                  if (value.length >= 8) return;
                  setAmount(e.target.value);
                }}
                placeholder="Amount"
                className={clsx(
                  "[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none mr-3",
                  "bg-transparent text-white py-3 w-full",
                  "focus:outline-none text-right rounded-r-sm"
                )}
              />
            </div>

            <div className="flex flex-col items-center justify-center bg-neutral-800 rounded-md py-8">
              <div className="text-yellow text-3xl font-bold max-w-full">
                {isCalculating ?
                  <div className="flex items-center justify-center">
                    <i
                      className={clsx(
                        "w-8 h-8 border-4 border-transparent border-t-yellow rounded-[50%] my-2",
                        "animate-loadingSpinner"
                      )}
                    />
                  </div>
                : <>
                    {Number(calculatedRewards).toLocaleString(undefined, {
                      maximumFractionDigits:
                        Number(calculatedRewards) > 1000000 ? 0 : 2,
                    })}
                  </>
                }
              </div>
              <div className="text-sm text-yellow font-normal">NAM</div>
              <div className="text-neutral-400 text-xs mt-1 px-4 text-center">
                Est. shielded rewards per 24hrs
              </div>
            </div>
          </>
        )}
      </div>
    </Panel>
  );
};
