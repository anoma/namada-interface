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
  SDK = "Anoma::SDK",
}

export enum KVKeys {
  Chains = "chains",
}
