export default {
  approveTx: (): string => `/tx`,
  login: (): string => `/login`,
  approveConnection: (): string => `/connection`,
  setup: (): string => `/setup`,
  changePassword: (): string => `/change-password`,
  connectedSites: (): string => `/connected-sites`,
  network: (): string => `/network`,
  warnings: (): string => `/warnings`,
  viewAccountList: () => `/accounts/view`,
  accountsUpdateRequired: () => `/accounts/view/update-required`,
  viewAccountMnemonic: (accountId: string = ":accountId") =>
    `/accounts/mnemonic/${accountId}`,
  viewAccount: (accountId: string = ":accountId") =>
    `/accounts/view/${accountId}`,
  viewViewingKey: (viewingKey: string = ":viewingKey") =>
    `/accounts/view/viewingKey/${viewingKey}`,
  deleteAccount: (accountId: string = ":accountId") =>
    `/accounts/delete/${accountId}`,
  renameAccount: (accountId: string = ":accountId") =>
    `/accounts/rename/${accountId}`,
};
