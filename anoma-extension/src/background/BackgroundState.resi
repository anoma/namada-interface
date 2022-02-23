type state =
  | Empty
  | Locked
  | Unlocked

type t

let getSelectedKey: t => option<Anoma.Keypair.t>
