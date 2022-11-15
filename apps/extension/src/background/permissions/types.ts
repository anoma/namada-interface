export interface PermissionsStore {
  id: string;
  chainId: string;
  permissions:
    | {
        [type: string]:
          | {
              [origin: string]: true | undefined;
            }
          | undefined;
      }
    | undefined;
}
