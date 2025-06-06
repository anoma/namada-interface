import { Panel } from "@namada/components";
import { AssetImage } from "App/Transfer/AssetImage";
import {
  chainAssetsMapAtom,
  chainParametersAtom,
  maspRewardsAtom,
} from "atoms/chain";
import { simulateShieldedRewards } from "atoms/staking/services";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { debounce } from "lodash";
import { useEffect, useRef, useState } from "react";
import { GoChevronDown } from "react-icons/go";
import { MaspAssetRewards } from "types";
import { toBaseAmount } from "utils";

export const MaspRewardCalculator = (): JSX.Element => {
  const rewards = useAtomValue(maspRewardsAtom);
  const [amount, setAmount] = useState<string>("");
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
  const chainAssetsMap = useAtomValue(chainAssetsMapAtom);

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
      if (!selectedAsset || !amount || !chainId) return;

      const assetAddress = findAssetAddress(
        selectedAsset.asset.symbol.toLowerCase()
      );
      if (!assetAddress) {
        console.error(
          "Could not find address for asset:",
          selectedAsset.asset.symbol
        );
        return;
      }

      setIsCalculating(true);
      try {
        const rewardsResult = await simulateShieldedRewards(
          chainId,
          assetAddress,
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

  // Helper function to find the address for a given asset base
  const findAssetAddress = (symbol: string): string | undefined => {
    if (!Object.keys(chainAssetsMap).length) return undefined;
    // Find the entry in chainAssetsMap where the asset.base matches our assetBase
    for (const [address, assetInfo] of Object.entries(chainAssetsMap)) {
      if (assetInfo?.symbol.toLowerCase() === symbol) {
        return address;
      }
    }
    return undefined;
  };

  // Filter assets based on search term
  const filteredRewards =
    rewards.data?.filter((reward) =>
      reward.asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <Panel className={clsx("flex flex-col pt-2 pb-2 px-2")}>
      <h2 className="uppercase text-[13px] text-center font-medium pb-0 pt-2">
        MASP REWARDS CALCULATOR
      </h2>
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
            <div className="flex gap-0 bg-neutral-900 rounded-sm relative">
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
                      "bg-neutral-800 rounded-md",
                      "max-h-[300px] overflow-hidden"
                    )}
                  >
                    <div className="border-none">
                      <div className="relative">
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search assets..."
                          className={clsx(
                            "w-full pl-10 pr-3 py-2 bg-neutral-900 text-white",
                            "border-none border-neutral-600 text-sm",
                            "focus:outline-none focus:border-neutral-500"
                          )}
                        />
                      </div>
                    </div>

                    <div className="max-h-[200px] overflow-y-auto border border-neutral-600 dark-scrollbar overscroll-contain">
                      {filteredRewards.length === 0 ?
                        <div className="p-3 text-center text-neutral-400 text-sm">
                          No assets found
                        </div>
                      : filteredRewards.map((reward, idx) => (
                          <button
                            key={reward.asset.base + "_" + idx}
                            type="button"
                            onClick={() => handleAssetSelect(reward)}
                            className={clsx(
                              "w-full flex items-center py-1.5 px-1 text-left",
                              "transition-colors"
                            )}
                          >
                            <div className="px-2 py-1 gap-4 hover:bg-neutral-700 rounded-sm ml-2 flex w-full">
                              <div className="w-8 h-8 flex-shrink-0 ">
                                <AssetImage asset={reward.asset} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-white font-medium text-sm mt-1.5">
                                  {reward.asset.symbol}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>

              <input
                type="number"
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

            <div className="flex flex-col items-center justify-center border border-neutral-500 rounded-sm py-8">
              <div className="text-yellow text-2xl font-bold max-w-full">
                {isCalculating ?
                  <div className="flex items-center justify-center">
                    <i
                      className={clsx(
                        "w-5 h-5 border-4 border-transparent border-t-yellow rounded-[50%] my-2",
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
