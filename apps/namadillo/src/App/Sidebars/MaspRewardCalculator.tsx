import { Panel, SkeletonLoading } from "@namada/components";
import { AssetImage } from "App/Transfer/AssetImage";
import { cachedShieldedRewardsAtom } from "atoms/balance";
import { maspRewardsAtom } from "atoms/chain";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { useEffect, useRef, useState } from "react";
import { GoChevronDown } from "react-icons/go";
import { MaspAssetRewards } from "types";

export const MaspRewardCalculator = (): JSX.Element => {
  const rewards = useAtomValue(maspRewardsAtom);
  const [amount, setAmount] = useState<string>("");
  const [selectedAsset, setSelectedAsset] = useState<
    MaspAssetRewards | undefined
  >(rewards.data?.[0] || undefined);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter assets based on search term
  const filteredRewards =
    rewards.data?.filter((reward) =>
      reward.asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  // Set initial selected asset when rewards data loads
  useEffect(() => {
    if (rewards.data && rewards.data.length > 0 && !selectedAsset) {
      setSelectedAsset(rewards.data[0]);
    }
  }, [rewards.data, selectedAsset]);

  // Close dropdown when clicking outside
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

  const estimatedRewards = useAtomValue(cachedShieldedRewardsAtom);
  return (
    <Panel className={clsx("flex flex-col pt-2 pb-2 px-2")}>
      <h2 className="uppercase text-[13px] text-center font-medium pb-0 pt-2">
        MASP REWARDS CALCULATOR
      </h2>
      <div className="mt-3 flex flex-col gap-3">
        {rewards.isLoading && (
          <div className="flex flex-col gap-1">
            <SkeletonLoading height="40px" width="100%" />
            <SkeletonLoading height="40px" width="100%" />
            <SkeletonLoading height="40px" width="100%" />
          </div>
        )}
        {rewards.data && (
          <>
            {/* Currency Select and Amount Input on same line */}
            <div className="flex gap-0 bg-neutral-900 rounded-sm relative">
              {/* Currency Selector */}
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
                {/* Dropdown */}
                {isDropdownOpen && (
                  <div
                    className={clsx(
                      "absolute top-full left-0 w-full z-50 mt-1",
                      "bg-neutral-800 rounded-sm",
                      "max-h-[300px] overflow-hidden"
                    )}
                  >
                    {/* Search Input */}
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

                    {/* Asset List */}
                    <div className="max-h-[200px] overflow-y-auto border border-neutral-600 dark-scrollbar overscroll-contain">
                      {filteredRewards.length === 0 ?
                        <div className="p-3 text-center text-neutral-400 text-sm">
                          No assets found
                        </div>
                      : filteredRewards.map((reward) => (
                          <button
                            key={reward.asset.base}
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

              {/* Amount Input */}
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  const value = e.target.value;
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
              <div className="text-yellow text-3xl font-bold max-w-full px-4">
                {estimatedRewards.amount.toString()}
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
