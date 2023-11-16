// import { Chain } from "@namada/types";
// import { Handler, Env, Message, InternalHandler } from "router";
// import { ChainsService } from "./service";
// import { RemoveChainMsg } from "./messages";
// import { SuggestChainMsg, GetChainsMsg, GetChainMsg } from "provider/messages";
//
// type Writeable<T> = { -readonly [P in keyof T]: T[P] };
//
// export const getHandler: (service: ChainsService) => Handler = (service) => {
//   return (env: Env, msg: Message<unknown>) => {
//     switch (msg.constructor) {
//       case GetChainMsg:
//         return handleGetChainMsg(service)(env, msg as GetChainMsg);
//       case GetChainsMsg:
//         return handleGetChainsMsg(service)(env, msg as GetChainsMsg);
//       case SuggestChainMsg:
//         return handleSuggestChainMsg(service)(env, msg as SuggestChainMsg);
//       case RemoveChainMsg:
//         return handleRemoveChainMsg(service)(env, msg as RemoveChainMsg);
//       default:
//         throw new Error("Unknown msg type");
//     }
//   };
// };
//
// const handleGetChainsMsg: (
//   service: ChainsService
// ) => InternalHandler<GetChainsMsg> = (service) => {
//   return async () => {
//     return await service.getChains();
//   };
// };
//
// const handleGetChainMsg: (
//   service: ChainsService
// ) => InternalHandler<GetChainMsg> = (service) => {
//   return async (_, msg) => {
//     return await service.getChain(msg.chainId);
//   };
// };
//
// const handleSuggestChainMsg: (
//   service: ChainsService
// ) => InternalHandler<SuggestChainMsg> = (service) => {
//   return async (env, msg) => {
//     if (await service.hasChain(msg.chain.chainId)) {
//       return;
//     }
//
//     const chain = msg.chain as Writeable<Chain>;
//     await service.suggestChain(env, chain, msg.origin);
//   };
// };
//
// const handleRemoveChainMsg: (
//   service: ChainsService
// ) => InternalHandler<RemoveChainMsg> = (service) => {
//   return async (_, msg) => {
//     await service.removeChain(msg.chainId);
//     return await service.getChains();
//   };
// };
