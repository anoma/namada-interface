%%raw(`
import { Buffer } from 'buffer'
import '../styles'
window.global = window
window.Buffer = Buffer
`)

Database.openDb()
->Promise.then(Database.getKeyStorageState)
->Promise.then(keyStorageState =>
  switch keyStorageState {
  | Database.Empty => {
      open Tab

      Tab.create({
        url: "/dist/accountCreation/index.html",
      })->Promise.thenResolve(Window.close)
    }
  | Database.NonEmpty =>
    Anoma.Init.init()->Promise.thenResolve(_ => {
      switch ReactDOM.querySelector("#app") {
      | Some(element) => ReactDOM.render(<Popup />, element)
      | None => Js.Console.error("Could not find root element")
      }
    })
  }
)
->Promise.catch(err => {
  Js.Console.error(err)
  Promise.resolve()
})
->Utils.Promise.done
