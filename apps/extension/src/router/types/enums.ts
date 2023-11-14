export enum Ports {
  WebBrowser = "web-browser-port",
  Content = "content-port",
  Background = "background-port",
}

export enum Events {
  KeystoreChanged = "namada-keystore-changed",
  PushEventData = "namada-push-event-data",
}

export enum Routes {
  InteractionForeground = "namada-interaction-foreground",
}

export enum KVPrefix {
  IndexedDB = "Namada::IndexedDB",
  LocalStorage = "Namada::LocalStorage",
  Memory = "Namada::Memory",
  SDK = "Namada::SDK",
  Utility = "Namada::Utility",
  ConnectedTabs = "Namada::ConnectedTabs",
  RevealedPK = "Namada::RevealedPK",
  SessionStorage = "Namada::SessionStorage",
}

export enum KVKeys {
  Chains = "chains",
}
