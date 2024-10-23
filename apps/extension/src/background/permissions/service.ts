import { AllowedPermissions, LocalStorage, PermissionKind } from "storage";

export class PermissionsService {
  constructor(protected readonly localStorage: LocalStorage) {}

  async enablePermissions(
    domain: string,
    chainId: string,
    allowed: AllowedPermissions
  ): Promise<void> {
    const existingPermissions = await this.localStorage.getPermissions();
    const newPermissions = [...new Set<PermissionKind>(allowed)];

    if (existingPermissions) {
      existingPermissions[domain] = existingPermissions[domain] || {};
      existingPermissions[domain][chainId] = newPermissions;
      return await this.localStorage.setPermissions(existingPermissions);
    }

    return await this.localStorage.setPermissions({
      [domain]: {
        [chainId]: newPermissions,
      },
    });
  }

  async revokeChainPermissions(domain: string, chainId: string): Promise<void> {
    const updatedPermissions = await this.localStorage.getPermissions();
    if (
      !updatedPermissions ||
      !updatedPermissions[domain] ||
      !updatedPermissions[domain][chainId]
    ) {
      return;
    }
    delete updatedPermissions[domain][chainId];
    await this.localStorage.setPermissions(updatedPermissions);
  }

  async permissionsByDomain(
    domain: string
  ): Promise<Record<string, AllowedPermissions> | undefined> {
    const permissions = await this.localStorage.getPermissions();

    if (permissions && permissions[domain]) {
      return permissions[domain];
    }
  }

  async permissionsByChain(
    domain: string,
    chainId: string
  ): Promise<AllowedPermissions | undefined> {
    const permissions = await this.localStorage.getPermissions();
    if (permissions && permissions[domain] && permissions[domain][chainId]) {
      return permissions[domain][chainId];
    }
  }
}
