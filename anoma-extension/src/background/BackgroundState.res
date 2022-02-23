type state =
  | Empty
  | Locked
  | Unlocked

type t = {
  mutable selectedKey: option<Anoma.Keypair.t>,
  mutable currentWindows: array<Anoma.Bridge.Message.Sender.t>,
}

let getSelectedKey = state => state.selectedKey
