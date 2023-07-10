export enum Ports {
  WebBrowser = "web-browser-port",
  Content = "content-port",
  Background = "background-port",
}

export enum Events {
  KeystoreChanged = "anoma-keystore-changed",
  PushEventData = "anoma-push-event-data",
}

export enum Routes {
  InteractionForeground = "anoma-interaction-foreground",
}

export enum KVPrefix {
  IndexedDB = "Anoma::IndexedDB",
  LocalStorage = "Anoma::LocalStorage",
  Memory = "Anoma::Memory",
  SDK = "Anoma::SDK",
  Utility = "Anoma::Utility",
  ConnectedTabs = "Anoma::ConnectedTabs",
}

export enum KVKeys {
  Chains = "chains",
}
