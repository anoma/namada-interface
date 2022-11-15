import { Handler, Env, Message, InternalHandler } from "router";
import { PermissionsService } from "./service";

export const getHandler: (service: PermissionsService) => Handler = (
  service
) => {
  return (env: Env, msg: Message<unknown>) => {
    console.log({ env, service });
    switch (msg.constructor) {
      default:
        throw new Error("Unknown msg type");
    }
  };
};
