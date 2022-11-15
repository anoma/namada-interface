import { Message } from "router";
import { ROUTE } from "./constants";

enum MessageType {
  EnableAccess = "enable-access",
  GetOriginPermissions = "get-origin-permissions",
  AddOriginPermission = "add-origin-permission",
  RemoveOriginPermission = "remove-origin-permission",
  GetPermittedChains = "get-permitted-chains",
}

export class EnableAccessMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.EnableAccess;
  }

  constructor(public readonly chainIds: string[]) {
    super();
  }

  validate(): void {
    if (!this.chainIds || this.chainIds.length === 0) {
      throw new Error("chain id not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  approveExternal(): boolean {
    return true;
  }

  type(): string {
    return EnableAccessMsg.type();
  }
}

export class GetOriginPermissionsMsg extends Message<string[]> {
  public static type(): MessageType {
    return MessageType.GetOriginPermissions;
  }

  constructor(
    public readonly chainId: string,
    public readonly permissionType: string
  ) {
    super();
  }

  validate(): void {
    if (!this.chainId) {
      throw new Error("chain id not set");
    }

    if (!this.permissionType) {
      throw new Error("empty permission type");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetOriginPermissionsMsg.type();
  }
}

export class GetPermittedChainsMsg extends Message<string[]> {
  public static type(): MessageType {
    return MessageType.GetPermittedChains;
  }

  constructor(
    public readonly permissionOrigin: string,
    public readonly permissionType: string
  ) {
    super();
  }

  validate(): void {
    if (!this.permissionOrigin) {
      throw new Error("origin not set");
    }

    if (!this.permissionType) {
      throw new Error("empty permission type");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetPermittedChainsMsg.type();
  }
}

export class AddOriginPermission extends Message<void> {
  public static type(): MessageType {
    return MessageType.AddOriginPermission;
  }

  constructor(
    public readonly chainId: string,
    public readonly permissionType: string,
    public readonly permissionOrigin: string
  ) {
    super();
  }

  validate(): void {
    if (!this.chainId) {
      throw new Error("chain id not set");
    }

    if (!this.permissionType) {
      throw new Error("empty permission type");
    }

    if (!this.permissionOrigin) {
      throw new Error("empty permission origin");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return AddOriginPermission.type();
  }
}

export class RemoveOriginPermission extends Message<void> {
  public static type(): MessageType {
    return MessageType.RemoveOriginPermission;
  }

  constructor(
    public readonly chainId: string,
    public readonly permissionType: string,
    public readonly permissionOrigin: string
  ) {
    super();
  }

  validate(): void {
    if (!this.chainId) {
      throw new Error("chain id not set");
    }

    if (!this.permissionType) {
      throw new Error("empty permission type");
    }

    if (!this.permissionOrigin) {
      throw new Error("empty permission origin");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RemoveOriginPermission.type();
  }
}
