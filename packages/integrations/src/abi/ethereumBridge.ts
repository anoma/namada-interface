export const ethereumBridgeAbi = [
  {
    inputs: [
      {
        internalType: "uint8",
        name: "_version",
        type: "uint8",
      },
      {
        internalType: "address[]",
        name: "_currentValidators",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "_currentPowers",
        type: "uint256[]",
      },
      {
        internalType: "address[]",
        name: "_nextValidators",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "_nextPowers",
        type: "uint256[]",
      },
      {
        internalType: "uint256",
        name: "_thresholdVotingPower",
        type: "uint256",
      },
      {
        internalType: "contract IProxy",
        name: "_proxy",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "nonce",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "address",
            name: "from",
            type: "address",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
          {
            internalType: "bytes32",
            name: "namadaDataDigest",
            type: "bytes32",
          },
        ],
        indexed: false,
        internalType: "struct ICommon.Erc20Transfer[]",
        name: "transfers",
        type: "tuple[]",
      },
      {
        indexed: false,
        internalType: "bool[]",
        name: "validMap",
        type: "bool[]",
      },
      {
        indexed: false,
        internalType: "string",
        name: "relayerAddress",
        type: "string",
      },
    ],
    name: "TransferToErc",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "nonce",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "address",
            name: "from",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "to",
            type: "string",
          },
        ],
        indexed: false,
        internalType: "struct ICommon.NamadaTransfer[]",
        name: "transfers",
        type: "tuple[]",
      },
      {
        indexed: false,
        internalType: "bool[]",
        name: "validMap",
        type: "bool[]",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "confirmations",
        type: "uint256",
      },
    ],
    name: "TransferToNamada",
    type: "event",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address[]",
            name: "validators",
            type: "address[]",
          },
          {
            internalType: "uint256[]",
            name: "powers",
            type: "uint256[]",
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256",
          },
        ],
        internalType: "struct ICommon.ValidatorSetArgs",
        name: "_validatorSetArgs",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "bytes32",
            name: "r",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "s",
            type: "bytes32",
          },
          {
            internalType: "uint8",
            name: "v",
            type: "uint8",
          },
        ],
        internalType: "struct ICommon.Signature[]",
        name: "_signatures",
        type: "tuple[]",
      },
      {
        internalType: "bytes32",
        name: "_message",
        type: "bytes32",
      },
    ],
    name: "authorize",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address[]",
            name: "validators",
            type: "address[]",
          },
          {
            internalType: "uint256[]",
            name: "powers",
            type: "uint256[]",
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256",
          },
        ],
        internalType: "struct ICommon.ValidatorSetArgs",
        name: "_validatorSetArgs",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "bytes32",
            name: "r",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "s",
            type: "bytes32",
          },
          {
            internalType: "uint8",
            name: "v",
            type: "uint8",
          },
        ],
        internalType: "struct ICommon.Signature[]",
        name: "_signatures",
        type: "tuple[]",
      },
      {
        internalType: "bytes32",
        name: "_message",
        type: "bytes32",
      },
    ],
    name: "authorizeNext",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "currentValidatorSetHash",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "nextValidatorSetHash",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "address[]",
                name: "validators",
                type: "address[]",
              },
              {
                internalType: "uint256[]",
                name: "powers",
                type: "uint256[]",
              },
              {
                internalType: "uint256",
                name: "nonce",
                type: "uint256",
              },
            ],
            internalType: "struct ICommon.ValidatorSetArgs",
            name: "validatorSetArgs",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "bytes32",
                name: "r",
                type: "bytes32",
              },
              {
                internalType: "bytes32",
                name: "s",
                type: "bytes32",
              },
              {
                internalType: "uint8",
                name: "v",
                type: "uint8",
              },
            ],
            internalType: "struct ICommon.Signature[]",
            name: "signatures",
            type: "tuple[]",
          },
          {
            components: [
              {
                internalType: "address",
                name: "from",
                type: "address",
              },
              {
                internalType: "address",
                name: "to",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
              },
              {
                internalType: "bytes32",
                name: "namadaDataDigest",
                type: "bytes32",
              },
            ],
            internalType: "struct ICommon.Erc20Transfer[]",
            name: "transfers",
            type: "tuple[]",
          },
          {
            internalType: "bytes32",
            name: "poolRoot",
            type: "bytes32",
          },
          {
            internalType: "bytes32[]",
            name: "proof",
            type: "bytes32[]",
          },
          {
            internalType: "bool[]",
            name: "proofFlags",
            type: "bool[]",
          },
          {
            internalType: "uint256",
            name: "batchNonce",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "relayerAddress",
            type: "string",
          },
        ],
        internalType: "struct ICommon.RelayProof",
        name: "relayProof",
        type: "tuple",
      },
    ],
    name: "transferToErc",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "transferToErc20Nonce",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "from",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "to",
            type: "string",
          },
        ],
        internalType: "struct ICommon.NamadaTransfer[]",
        name: "_transfers",
        type: "tuple[]",
      },
      {
        internalType: "uint256",
        name: "confirmations",
        type: "uint256",
      },
    ],
    name: "transferToNamada",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "transferToNamadaNonce",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_validatorSetHash",
        type: "bytes32",
      },
    ],
    name: "updateValidatorSetHash",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
