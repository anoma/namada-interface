export const mainnetNamAssetOnOsmosis = {
  description: "The native token of Namada.",
  denom_units: [
    {
      denom:
        "ibc/C7110DEC66869DAE9BE9C3C60F4B5313B16A2204AE020C3B0527DD6B322386A3",
      exponent: 0,
      aliases: ["unam"],
    },
    {
      denom: "nam",
      exponent: 6,
    },
  ],
  type_asset: "ics20",
  base: "ibc/C7110DEC66869DAE9BE9C3C60F4B5313B16A2204AE020C3B0527DD6B322386A3",
  name: "Namada",
  display: "nam",
  symbol: "NAM",
  traces: [
    {
      type: "ibc",
      counterparty: {
        chain_name: "namada",
        base_denom: "unam",
        channel_id: "channel-1",
      },
      chain: {
        channel_id: "channel-98451",
        path: "transfer/channel-98451/unam",
      },
    },
  ],
  logo_URIs: {
    svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/namada/images/namada.svg",
  },
  images: [
    {
      image_sync: {
        chain_name: "namada",
        base_denom: "unam",
      },
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/namada/images/namada.svg",
    },
  ],
};

export const housefireNamAssetOnOsmosis = {
  description: "The native token of Namada.",
  denom_units: [
    {
      denom:
        "ibc/48473B990DD70EC30F270727C4FEBA5D49C7D74949498CDE99113B13F9EA5522",
      exponent: 0,
      aliases: ["unam"],
    },
    {
      denom: "nam",
      exponent: 6,
    },
  ],
  type_asset: "ics20",
  base: "ibc/48473B990DD70EC30F270727C4FEBA5D49C7D74949498CDE99113B13F9EA5522",
  name: "Namada",
  display: "nam",
  symbol: "NAM",
  traces: [
    {
      type: "ibc",
      counterparty: {
        chain_name: "namada",
        base_denom: "unam",
        channel_id: "channel-1",
      },
      chain: {
        channel_id: "channel-98451",
        path: "transfer/channel-98451/unam",
      },
    },
  ],
  logo_URIs: {
    svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/namada/images/namada.svg",
  },
  images: [
    {
      image_sync: {
        chain_name: "namada",
        base_denom: "unam",
      },
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/namada/images/namada.svg",
    },
  ],
};
