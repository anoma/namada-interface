%%raw(`
import { Buffer } from 'buffer'
import '../styles'
window.global = window
window.Buffer = Buffer
`)

switch ReactDOM.querySelector("#app") {
| Some(element) => ReactDOM.render(<Options />, element)
| None => Js.Console.error("Could not find root element")
}
