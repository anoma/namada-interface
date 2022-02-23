@react.component
let make = (~phrase, ~proceed, ~size: Anoma.Keypair.phraseSize, ~name, ~password) => {
  let (wordNumber, _) = React.useState(_ => Js.Math.random_int(1, (size :> int)))
  let (word, setWord) = React.useState(_ => "")

  let onChange = evt => {
    let value = ReactEvent.Form.currentTarget(evt)["value"]

    setWord(_ => value)
  }

  let (error, setError) = React.useState(_ => None)

  let validate = evt => {
    ReactEvent.Form.preventDefault(evt)

    let selectedWord =
      phrase->Anoma.Keypair.mnemonicToString->Js.String2.split(" ")->Array.getUnsafe(wordNumber - 1)

    if selectedWord === word {
      setError(_ => None)

      Database.openDb()
      ->Promise.then(db => Database.initDb(~db, ~mnemonicPhrase=phrase, ~password, ~name))
      ->Utils.Promise.mapError(error => {
        let errorMessage = switch error {
        | #keyAlreadyExists => "There is already an encrypted key in your browser"
        | #phraseAlreadyExists => "There is already a mnemonic phrase in your browser"
        | #unknownException(None) => "An unknown error happened. Please, contact our staff."
        | #unknownException(Some(msg)) =>
          "An unknown error happened. Please, contact our staff. Error message: " ++ msg
        }
        Promise.resolve(errorMessage)
      })
      ->Promise.thenResolve(result => {
        switch result {
        | Error(message) => setError(_ => Some(message))
        | Ok(_) => {
            setError(_ => None)

            proceed()
          }
        }
      })
      ->Utils.Promise.done
    } else {
      setError(_ => Some("Mnemonic phrase does not match"))
    }
  }

  let className = Cn.make([
    "px-3 py-2.5 border rounded-lg flex focus-within:border-yellow focus-within:ring-1 ring-yellow -base self-stretch",
    Option.isSome(error) ? "border-red" : "border-grey-light",
  ])

  <React.Fragment>
    <Heading level=#5 className="self-start mt-3.5 mb-8 text-black">
      {React.string("Verify Phrase")}
    </Heading>
    <Paragraph className="text-left mb-7.5 text-grey-light">
      {React.string(
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sit enim, sed volutpat vitae ultrices vulputate. Et quis.",
      )}
    </Paragraph>
    <form className="w-full flex flex-col items-center justify-start" onSubmit={validate}>
      <label htmlFor="word" className="font-display font-medium leading-7 mb-2.5 self-start">
        {React.string(`Word #${Int.toString(wordNumber)}`)}
      </label>
      <span className>
        <input
          className="font-display font-medium text-blue-dark w-full active:outline-none focus:outline-none"
          onChange
          id="word"
        />
      </span>
      {switch error {
      | None => React.null
      | Some(value) =>
        <p className="text-red font-display font-medium self-start mt-3.5">
          {React.string(value)}
        </p>
      }}
      <Button className="mt-15" label="Verify" color=#yellow />
    </form>
  </React.Fragment>
}
