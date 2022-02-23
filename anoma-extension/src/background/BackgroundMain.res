%%raw(`
import { Buffer } from 'buffer'
import '../styles'
window.global = window
window.Buffer = Buffer

if (import.meta.hot) {
  import('/@vite/client')
  import('./contentScriptHMR')
}
`)

let requestKeySelection = () => {
  Error("Not implemented yet")
}

Anoma.Init.init()
->Promise.thenResolve(_ => {
  open Anoma
  open Bridge

  let selectedKey: ref<option<Anoma.Keypair.pointer>> = ref(None)

  selectedKey := Keypair.generateMnemonic(#12)->Keypair.fromMnemonic(1)->Some

  onMessage(~message=Message.requestAddress, ~callback=_ => {
    switch selectedKey.contents {
    | Some(keypair) => Address.fromKeypair(keypair)->Address.encoded->Ok
    | None => requestKeySelection()
    }->Promise.resolve
  })->ignore

  onMessage(~message=Message.sign, ~callback=({data}) => {
    switch selectedKey.contents {
    | Some(keypair) => Keypair.sign(keypair, data)->Ok
    | None => requestKeySelection()
    }->Promise.resolve
  })->ignore

  onMessage(~message=Message.verifySignature, ~callback=({data: (publicKey, signature, data)}) => {
    Anoma.Keypair.verifySignature(~publicKey, ~signature, ~data)->Result.isOk->Promise.resolve
  })
})
->Utils.Promise.done
