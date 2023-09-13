import { type MetaMaskInpageProvider } from "@metamask/providers";
import MetaMaskSDK from "@metamask/sdk";
import { ethers } from "ethers";

import { Account, AccountType, Chain, TokenBalance } from "@namada/types";
import { shortenAddress } from "@namada/utils";
import { BridgeProps, Integration } from "./types/Integration";

const MULTIPLE_WALLETS = "Multiple wallets installed!";
const CANT_FETCH_ACCOUNTS = "Can't fetch accounts!";

type MetamaskWindow = Window &
  typeof globalThis & {
    ethereum: MetaMaskInpageProvider;
  };

class Metamask implements Integration<Account, unknown> {
  private _ethereum: MetaMaskInpageProvider | undefined;
  constructor(public readonly chain: Chain) {}

  private init(): void {
    if ((<MetamaskWindow>window).ethereum) {
      const MMSDK = new MetaMaskSDK();
      const provider = MMSDK.getProvider();

      this._ethereum = provider;
    }
  }

  detect(): boolean {
    this.init();
    const ethereum = (<MetamaskWindow>window).ethereum;

    return ethereum?.isMetaMask ?? false;
  }

  async accounts(): Promise<Account[] | undefined> {
    await this.syncChainId();

    const addresses = await this._ethereum?.request<string[]>({
      method: "eth_requestAccounts",
    });

    if (addresses && !Array.isArray(addresses)) {
      Promise.reject(CANT_FETCH_ACCOUNTS);
    }

    const accounts: Account[] = (addresses as string[]).map((address) => ({
      address,
      alias: shortenAddress(address, 16),
      chainId: this.chain.chainId,
      type: AccountType.PrivateKey,
      isShielded: false,
    }));

    return accounts;
  }

  signer(): unknown {
    return {};
  }

  async connect(): Promise<void> {
    if ((window as MetamaskWindow).ethereum === this._ethereum) {
      await this.syncChainId();
    } else {
      Promise.reject(MULTIPLE_WALLETS);
    }
  }

  private async syncChainId(): Promise<void> {
    const { chainId } = this.chain;

    await this._ethereum?.request<null>({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }],
    });
  }

  public async submitBridgeTransfer(props: BridgeProps): Promise<void> {
    const { sender, recipient, amount } = props.bridgeProps || {};
    //TODO: check this shit
    const amountNumber = amount?.toNumber() || 0;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner(sender);

    const tx = {
      from: "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",
      to: recipient,
      amount: amountNumber,
    };

    const abi = JSON.parse(getErc20Abi());
    const erc = new ethers.Contract(
      "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",
      abi,
      signer
    );
    const bridgeAbi = JSON.parse(getBridgeAbi());
    const bridge = new ethers.Contract(
      "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
      bridgeAbi,
      signer
    );

    await erc.approve(bridge.target, amountNumber);
    await bridge.transferToNamada([tx], 1);
  }

  public async queryBalances(owner: string): Promise<TokenBalance[]> {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const ethBalance = await provider.getBalance(owner);
    const signer = await provider.getSigner(owner);

    const abi = JSON.parse(getErc20Abi());
    const erc = new ethers.Contract(
      "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",
      abi,
      signer
    );
    const testErc20Balance: bigint = await erc.balanceOf(signer.address);

    return [
      { token: "ETH", amount: String(ethBalance) || "0" },
      { token: "TESTERC20", amount: String(testErc20Balance) || "0" },
    ];
  }
}

export default Metamask;

function getErc20Abi(): string {
  return `[
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "name": "allowance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "decimals",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "subtractedValue",
          "type": "uint256"
        }
      ],
      "name": "decreaseAllowance",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "addedValue",
          "type": "uint256"
        }
      ],
      "name": "increaseAllowance",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "mint",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "transfer",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
`;
}

function getBridgeAbi(): string {
  return `[
    {
      "inputs": [
        {
          "internalType": "uint8",
          "name": "_version",
          "type": "uint8"
        },
        {
          "internalType": "address[]",
          "name": "_currentValidators",
          "type": "address[]"
        },
        {
          "internalType": "uint256[]",
          "name": "_currentPowers",
          "type": "uint256[]"
        },
        {
          "internalType": "address[]",
          "name": "_nextValidators",
          "type": "address[]"
        },
        {
          "internalType": "uint256[]",
          "name": "_nextPowers",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256",
          "name": "_thresholdVotingPower",
          "type": "uint256"
        },
        {
          "internalType": "contract IProxy",
          "name": "_proxy",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "nonce",
          "type": "uint256"
        },
        {
          "components": [
            {
              "internalType": "address",
              "name": "from",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "to",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "bytes32",
              "name": "namadaDataDigest",
              "type": "bytes32"
            }
          ],
          "indexed": false,
          "internalType": "struct ICommon.Erc20Transfer[]",
          "name": "transfers",
          "type": "tuple[]"
        },
        {
          "indexed": false,
          "internalType": "bool[]",
          "name": "validMap",
          "type": "bool[]"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "relayerAddress",
          "type": "string"
        }
      ],
      "name": "TransferToErc",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "nonce",
          "type": "uint256"
        },
        {
          "components": [
            {
              "internalType": "address",
              "name": "from",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "to",
              "type": "string"
            }
          ],
          "indexed": false,
          "internalType": "struct ICommon.NamadaTransfer[]",
          "name": "transfers",
          "type": "tuple[]"
        },
        {
          "indexed": false,
          "internalType": "bool[]",
          "name": "validMap",
          "type": "bool[]"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "confirmations",
          "type": "uint256"
        }
      ],
      "name": "TransferToNamada",
      "type": "event"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "address[]",
              "name": "validators",
              "type": "address[]"
            },
            {
              "internalType": "uint256[]",
              "name": "powers",
              "type": "uint256[]"
            },
            {
              "internalType": "uint256",
              "name": "nonce",
              "type": "uint256"
            }
          ],
          "internalType": "struct ICommon.ValidatorSetArgs",
          "name": "_validatorSetArgs",
          "type": "tuple"
        },
        {
          "components": [
            {
              "internalType": "bytes32",
              "name": "r",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "s",
              "type": "bytes32"
            },
            {
              "internalType": "uint8",
              "name": "v",
              "type": "uint8"
            }
          ],
          "internalType": "struct ICommon.Signature[]",
          "name": "_signatures",
          "type": "tuple[]"
        },
        {
          "internalType": "bytes32",
          "name": "_message",
          "type": "bytes32"
        }
      ],
      "name": "authorize",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "address[]",
              "name": "validators",
              "type": "address[]"
            },
            {
              "internalType": "uint256[]",
              "name": "powers",
              "type": "uint256[]"
            },
            {
              "internalType": "uint256",
              "name": "nonce",
              "type": "uint256"
            }
          ],
          "internalType": "struct ICommon.ValidatorSetArgs",
          "name": "_validatorSetArgs",
          "type": "tuple"
        },
        {
          "components": [
            {
              "internalType": "bytes32",
              "name": "r",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "s",
              "type": "bytes32"
            },
            {
              "internalType": "uint8",
              "name": "v",
              "type": "uint8"
            }
          ],
          "internalType": "struct ICommon.Signature[]",
          "name": "_signatures",
          "type": "tuple[]"
        },
        {
          "internalType": "bytes32",
          "name": "_message",
          "type": "bytes32"
        }
      ],
      "name": "authorizeNext",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "currentValidatorSetHash",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "nextValidatorSetHash",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "components": [
                {
                  "internalType": "address[]",
                  "name": "validators",
                  "type": "address[]"
                },
                {
                  "internalType": "uint256[]",
                  "name": "powers",
                  "type": "uint256[]"
                },
                {
                  "internalType": "uint256",
                  "name": "nonce",
                  "type": "uint256"
                }
              ],
              "internalType": "struct ICommon.ValidatorSetArgs",
              "name": "validatorSetArgs",
              "type": "tuple"
            },
            {
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "r",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes32",
                  "name": "s",
                  "type": "bytes32"
                },
                {
                  "internalType": "uint8",
                  "name": "v",
                  "type": "uint8"
                }
              ],
              "internalType": "struct ICommon.Signature[]",
              "name": "signatures",
              "type": "tuple[]"
            },
            {
              "components": [
                {
                  "internalType": "address",
                  "name": "from",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                },
                {
                  "internalType": "bytes32",
                  "name": "namadaDataDigest",
                  "type": "bytes32"
                }
              ],
              "internalType": "struct ICommon.Erc20Transfer[]",
              "name": "transfers",
              "type": "tuple[]"
            },
            {
              "internalType": "bytes32",
              "name": "poolRoot",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32[]",
              "name": "proof",
              "type": "bytes32[]"
            },
            {
              "internalType": "bool[]",
              "name": "proofFlags",
              "type": "bool[]"
            },
            {
              "internalType": "uint256",
              "name": "batchNonce",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "relayerAddress",
              "type": "string"
            }
          ],
          "internalType": "struct ICommon.RelayProof",
          "name": "relayProof",
          "type": "tuple"
        }
      ],
      "name": "transferToErc",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "transferToErc20Nonce",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "from",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "to",
              "type": "string"
            }
          ],
          "internalType": "struct ICommon.NamadaTransfer[]",
          "name": "_transfers",
          "type": "tuple[]"
        },
        {
          "internalType": "uint256",
          "name": "confirmations",
          "type": "uint256"
        }
      ],
      "name": "transferToNamada",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "transferToNamadaNonce",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_validatorSetHash",
          "type": "bytes32"
        }
      ],
      "name": "updateValidatorSetHash",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]`;
}
