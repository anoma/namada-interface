export enum TxResponse {
  Hash = "tx.hash",
  Info = "info",
  Height = "height",
  Code = "code",
  GasUsed = "gas_used",
  InitializedAccounts = "initialized_accounts",
}

export enum IbcTxResponse {
  SourceChannel = "send_packet.packet_src_channel",
  SourcePort = "send_packet.packet_src_port",
  DestinationChannel = "send_packet.packet_dst_channel",
  DestinationPort = "send_packet.packet_dst_port",
  TimeoutHeight = "send_packet.packet_timeout_height",
  TimeoutTimestamp = "send_packet.packet_timeout_timestamp",
}
