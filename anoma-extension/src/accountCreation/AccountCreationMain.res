%%raw(`
import { Buffer } from 'buffer'
import '../styles'
window.global = window
window.Buffer = Buffer
`)

Anoma.Init.init()
->Promise.thenResolve(_ => {
  switch ReactDOM.querySelector("#app") {
  | Some(element) => ReactDOM.render(<AccountCreation />, element)
  | None => Js.Console.error("Could not find root element")
  }
})
->Utils.Promise.done
