export enum TxResponse {
  Hash = "applied.hash",
  Info = "applied.info",
  Height = "applied.height",
  Code = "applied.code",
  GasUsed = "applied.gas_used",
  InitializedAccounts = "applied.initialized_accounts",
}

export enum IbcTxResponse {
  SourceChannel = "send_packet.packet_src_channel",
  SourcePort = "send_packet.packet_src_port",
  DestinationChannel = "send_packet.packet_dst_channel",
  DestinationPort = "send_packet.packet_dst_port",
  TimeoutHeight = "send_packet.packet_timeout_height",
  TimeoutTimestamp = "send_packet.packet_timeout_timestamp",
}
