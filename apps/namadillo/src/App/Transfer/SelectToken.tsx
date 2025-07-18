import { Chain } from "@chain-registry/types";
import namadaChain from "@namada/chain-registry/namada/chain.json";
import { Modal, Stack } from "@namada/components";
import { ModalTransition } from "App/Common/ModalTransition";
import { Search } from "App/Common/Search";
import {
  namadaShieldedAssetsAtom,
  namadaTransparentAssetsAtom,
} from "atoms/balance";
import {
  allKeplrAssetsBalanceAtom,
  connectedWalletsAtom,
  getAvailableChains,
  getChainRegistryByChainName,
  namadaRegistryChainAssetsMapAtom,
} from "atoms/integrations";
import { tokenPricesFamily } from "atoms/prices/atoms";
import BigNumber from "bignumber.js";
import { useWalletManager } from "hooks/useWalletManager";
import { KeplrWalletManager } from "integrations/Keplr";
import { useAtom, useAtomValue } from "jotai";
import { useMemo, useState } from "react";
import { IoClose } from "react-icons/io5";
import { AssetWithAmount } from "types";
import { AddressDropdown } from "./AddressDropdown";
import { isNamadaAddress, isShieldedAddress } from "./common";

type Network = {
  name: string | undefined;
  icon?: string;
  chainId?: string;
};

type SelectTokenProps = {
  setSourceAddress: (address: string) => void;
  sourceAddress: string;
  isOpen: boolean;
  onClose: () => void;
  onSelect: ((selectedAsset: AssetWithAmount) => void) | undefined;
};

export const SelectToken = ({
  sourceAddress,
  setSourceAddress,
  isOpen,
  onClose,
  onSelect,
}: SelectTokenProps): JSX.Element | null => {
  const { data: availableAssets } = useAtomValue(
    isShieldedAddress(sourceAddress) ?
      namadaShieldedAssetsAtom
    : namadaTransparentAssetsAtom
  );
  const [connectedWallets, setConnectedWallets] = useAtom(connectedWalletsAtom);
  const chainAssets = useAtomValue(namadaRegistryChainAssetsMapAtom);
  const chainAssetsMap = Object.values(chainAssets.data ?? {});
  const ibcChains = useMemo(getAvailableChains, []);
  const allChains = [...ibcChains, namadaChain as unknown as Chain];
  const [filter, setFilter] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [isConnectingKeplr, setIsConnectingKeplr] = useState(false);

  // Create KeplrWalletManager instance and use with useWalletManager hook
  const keplr = new KeplrWalletManager();
  const keplrWalletManager = useWalletManager(keplr);

  // Get balances for connected chains
  const allKeplrBalances = useAtomValue(allKeplrAssetsBalanceAtom);

  const allNetworks: Network[] = useMemo(() => {
    return allChains
      .filter((chain) => chain.network_type !== "testnet")
      .map((chainAsset) => {
        return {
          name:
            chainAsset?.chain_name ?
              chainAsset.chain_name.charAt(0).toUpperCase() +
              chainAsset.chain_name.slice(1)
            : "",
          icon: chainAsset?.logo_URIs?.svg,
          chainId: chainAsset?.chain_id,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [chainAssetsMap]);

  // Create a mapping of assets to their network names for better filtering
  const assetToNetworkMap = useMemo(() => {
    const map: Record<string, string> = {};
    chainAssetsMap.forEach((asset) => {
      if (asset && asset.name) {
        // Map asset address to network name
        map[asset.address || asset.base] = asset.name;
      }
    });
    return map;
  }, [chainAssetsMap]);

  // Your tokens
  const tokens = useMemo(() => {
    const result: AssetWithAmount[] = [];

    // Check if current address is a Keplr address (not shielded or transparent Namada)
    const isKeplrAddress = !isNamadaAddress(sourceAddress);

    if (isKeplrAddress) {
      // For Keplr addresses, show all available chain assets with balance data from allKeplrBalances
      chainAssetsMap.forEach((asset) => {
        if (asset && asset.address && asset.name) {
          let amount = BigNumber(0);
          // Look for balance in allKeplrBalances using the known key format
          if (allKeplrBalances.data) {
            const trace = asset.traces?.find((t) => t.type === "ibc");
            if (trace?.counterparty) {
              // For IBC assets: try both chainName:baseDenom and chainName:ibcDenom
              const chainName = trace.counterparty.chain_name;
              const baseDenom = trace.counterparty.base_denom;

              // Try baseDenom first (e.g., "osmosis:uosmo")
              let key = `${chainName}:${baseDenom}`;
              if (allKeplrBalances.data[key]) {
                amount = allKeplrBalances.data[key].amount;
              } else {
                // Try with asset.base as IBC denom (e.g., "osmosis:ibc/...")
                key = `${chainName}:${asset.base}`;
                if (allKeplrBalances.data[key]) {
                  amount = allKeplrBalances.data[key].amount;
                }
              }
            } else {
              // For native assets: chainName:base
              const chainName = asset.name?.toLowerCase();
              if (chainName) {
                const key = `${chainName}:${asset.base}`;
                if (allKeplrBalances.data[key]) {
                  amount = allKeplrBalances.data[key].amount;
                }
              }
            }
          }

          result.push({
            asset: {
              type_asset: asset.type_asset,
              address: asset.address,
              name: asset.name,
              symbol: asset.symbol || asset.name,
              logo_URIs: asset.logo_URIs,
              traces: asset.traces,
              denom_units: asset.denom_units,
              base: asset.base,
              display: asset.display,
            },
            amount: amount,
          });
        }
      });
    } else {
      // For Namada addresses, use the appropriate assets atom
      Object.values(availableAssets ?? {}).forEach((item) => {
        if (item.asset && item.asset.address) {
          result.push(item);
        }
      });
    }

    return result;
  }, [
    sourceAddress,
    availableAssets,
    chainAssetsMap,
    connectedWallets.keplr,
    allKeplrBalances.data,
  ]);

  // Get token prices for USD calculation
  const tokenAddresses = tokens
    .map((token) => token.asset.address)
    .filter((address): address is string => Boolean(address));

  const tokenPrices = useAtomValue(tokenPricesFamily(tokenAddresses));

  const filteredTokens = useMemo(() => {
    return tokens
      .filter((token) => {
        // Filter by search term
        const matchesSearch =
          token.asset.name.toLowerCase().includes(filter.toLowerCase()) ||
          token.asset.symbol.toLowerCase().includes(filter.toLowerCase());

        // Filter by selected network (if any)
        const tokenNetworkName =
          assetToNetworkMap[token.asset.address || ""] || token.asset.name;
        const matchesNetwork =
          selectedNetwork === null || tokenNetworkName === selectedNetwork;

        return matchesSearch && matchesNetwork;
      })
      .sort((a, b) => Number(b.amount) - Number(a.amount));
  }, [tokens, filter, selectedNetwork, assetToNetworkMap]);

  const handleNetworkSelect = (networkName: string): void => {
    setSelectedNetwork(selectedNetwork === networkName ? null : networkName);
  };

  const handleAddressChange = (address: string): void => {
    setSourceAddress(address); // Reset network filter when address changes
    setSelectedNetwork(null);
  };

  const handleTokenSelect = async (token: AssetWithAmount): Promise<void> => {
    // Check if current address is Keplr and if we need to connect to specific chain for this token
    const isKeplrTokenSource = !isNamadaAddress(sourceAddress);
    const isIbcOrKeplrToken = isKeplrTokenSource;

    try {
      if (isIbcOrKeplrToken) {
        setIsConnectingKeplr(true);

        try {
          // Run the logic from lines 229-236
          const keplrInstance = await keplr.get();

          if (!keplrInstance) {
            // Keplr is not installed, redirect to download page
            keplr.install();
            return;
          }

          let targetChainRegistry = null;

          // Find the correct chain for this token
          if (token.asset.traces?.[0]?.counterparty?.chain_name) {
            // Use the chain name from traces
            const chainName = token.asset.traces[0].counterparty.chain_name;
            targetChainRegistry = getChainRegistryByChainName(chainName);
          } else {
            // Fallback: try to find chain by looking at the token's network in assetToNetworkMap
            const tokenNetworkName =
              assetToNetworkMap[token.asset.address || ""];
            if (tokenNetworkName && tokenNetworkName !== "Namada") {
              targetChainRegistry = getChainRegistryByChainName(
                tokenNetworkName.toLowerCase()
              );
            }
          }

          if (targetChainRegistry) {
            // Use useWalletManager's connectToChainId method for the specific chain
            const chainId = targetChainRegistry.chain.chain_id;
            await keplrWalletManager.connectToChainId(chainId);

            // Update connected wallets state only after successful connection
            setConnectedWallets((obj: Record<string, boolean>) => ({
              ...obj,
              [keplr.key]: true,
            }));
          } else {
            console.warn(
              "Could not determine target chain for token:",
              token.asset.symbol,
              "Network:",
              assetToNetworkMap[token.asset.address || ""]
            );
            // Don't connect if we can't determine the target chain
            setIsConnectingKeplr(false);
            return;
          }
        } catch (error) {
          console.error(
            "Failed to connect to Keplr for token:",
            token.asset.symbol,
            error
          );
          // Continue with token selection even if Keplr connection fails
        } finally {
          setIsConnectingKeplr(false);
        }
      }

      // Proceed with token selection
      onSelect?.(token);
      onClose();
    } catch (error) {
      console.error("Error in token selection:", error);
      setIsConnectingKeplr(false);
      // Still allow token selection to proceed
      onSelect?.(token);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal onClose={onClose} className="py-20">
        <ModalTransition>
          <div className="flex rounded-xl border border-neutral-700 overflow-hidden h-[500px]">
            {/* Left panel */}
            <div className="w-[300px] bg-neutral-900 p-6 flex flex-col overflow-auto">
              <h5 className="text-neutral-500 text-sm mb-0">Your account</h5>
              <div className="mb-4">
                <AddressDropdown
                  selectedAddress={sourceAddress}
                  onSelectAddress={handleAddressChange}
                  showAddress={true}
                />
              </div>

              <h2 className="text-neutral-500 text-sm mb-4">Networks</h2>
              <Stack
                as="ul"
                gap={2}
                className="flex-1 overflow-auto dark-scrollbar"
              >
                <li>
                  <button
                    onClick={() => setSelectedNetwork(null)}
                    className={`flex items-center gap-3 p-2 w-full rounded-lg transition-colors ${
                      selectedNetwork === null ?
                        "bg-yellow/20 border border-yellow"
                      : "hover:bg-neutral-800"
                    }`}
                  >
                    <div className="w-8 h-8 overflow-hidden rounded-full bg-neutral-800 flex items-center justify-center">
                      <span className="text-white">All</span>
                    </div>
                    <span
                      className={
                        selectedNetwork === null ? "text-yellow" : "text-white"
                      }
                    >
                      All Networks
                    </span>
                  </button>
                </li>
                {allNetworks.map((network) => (
                  <li key={network.name}>
                    <button
                      onClick={() => handleNetworkSelect(network.name || "")}
                      className={`flex items-center gap-3 p-2 w-full rounded-lg transition-colors ${
                        selectedNetwork === network.name ?
                          "bg-yellow/20 border border-yellow"
                        : "hover:bg-neutral-800"
                      }`}
                    >
                      <div className="w-8 h-8 overflow-hidden rounded-full bg-neutral-800 flex items-center justify-center">
                        {network.icon ?
                          <img
                            src={network.icon}
                            alt={network.name}
                            className="w-6 h-6"
                          />
                        : <span className="text-white">
                            {network.name?.charAt(0)}
                          </span>
                        }
                      </div>
                      <span
                        className={
                          selectedNetwork === network.name ?
                            "text-yellow"
                          : "text-white"
                        }
                      >
                        {network.name}
                      </span>
                    </button>
                  </li>
                ))}
              </Stack>
            </div>

            {/* Right panel - Token Selection */}
            <div className="bg-black w-[500px] p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-white text-xl font-medium">Select Token</h2>
                <button
                  onClick={onClose}
                  className="text-white hover:text-yellow"
                >
                  <IoClose size={24} />
                </button>
              </div>

              <div className="mb-6">
                <Search
                  placeholder="Insert token name or symbol"
                  onChange={setFilter}
                />
              </div>

              <div className="mb-6">
                <div className="h-[400px] overflow-auto dark-scrollbar">
                  <Stack as="ul" gap={2} className="pb-15">
                    {filteredTokens.length > 0 ?
                      filteredTokens.map((token) => {
                        const isKeplrAddress = !isNamadaAddress(sourceAddress);

                        // For Keplr addresses, only show amounts if we have balance data and it's > 0
                        // For Namada addresses, show amounts if > 0
                        const showAmount =
                          isKeplrAddress ?
                            token.amount.gt(0) && connectedWallets.keplr
                          : token.amount.gt(0);
                        return (
                          <li key={token.asset.address}>
                            <button
                              onClick={() => handleTokenSelect(token)}
                              disabled={isConnectingKeplr}
                              className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
                                  {(
                                    token.asset.logo_URIs?.png ||
                                    token.asset.logo_URIs?.svg
                                  ) ?
                                    <img
                                      src={
                                        token.asset.logo_URIs?.png ||
                                        token.asset.logo_URIs?.svg
                                      }
                                      alt={token.asset.symbol}
                                      className="w-10 h-10"
                                    />
                                  : <span className="text-white text-lg">
                                      {token.asset.symbol.charAt(0)}
                                    </span>
                                  }
                                </div>
                                <div className="flex flex-col items-start">
                                  <span className="text-white font-medium">
                                    {token.asset.symbol}
                                  </span>
                                  {token.asset.traces?.[0]?.counterparty
                                    .chain_name && (
                                    <span className="text-xs capitalize text-neutral-400">
                                      {token.asset.traces?.[0]?.counterparty
                                        .chain_name ?? ""}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                {showAmount && (
                                  <>
                                    <div className="text-white">
                                      {token.amount.toString()}
                                    </div>
                                    <div className="text-neutral-400 text-sm">
                                      {(() => {
                                        const tokenPrice =
                                          token.asset.address ?
                                            tokenPrices.data?.[
                                              token.asset.address
                                            ]
                                          : undefined;
                                        if (tokenPrice) {
                                          const usdValue =
                                            token.amount.multipliedBy(
                                              tokenPrice
                                            );
                                          return `$${usdValue.toFixed(2)}`;
                                        }
                                        return null;
                                      })()}
                                    </div>
                                  </>
                                )}
                              </div>
                            </button>
                          </li>
                        );
                      })
                    : <p className="text-neutral-400">No tokens found</p>}
                  </Stack>
                </div>
              </div>

              {isConnectingKeplr && (
                <div className="text-center text-yellow text-sm">
                  Connecting to Keplr...
                </div>
              )}
            </div>
          </div>
        </ModalTransition>
      </Modal>
    </>
  );
};
