@react.component
let make = (~phrase, ~proceed) => {
  let phraseString = Anoma.Keypair.mnemonicToString(phrase)

  let words = Js.String2.split(phraseString, " ")

  let copyToClipboard = _ => {
    phraseString
    ->Clipboard.writeText
    ->Promise.catch(error => {
      Js.Console.error(error)
      Promise.resolve()
    })
    ->ignore
  }

  let downloadUrl = Blob.make([phraseString], {type_: #"text/plain"})->Blob.createURL

  <React.Fragment>
    <Heading level=#5 className="self-start mt-7.5"> {React.string("Recovery Phrase")} </Heading>
    <Paragraph className="text-grey-light mt-3.5 mb-7.5 font-medium">
      {React.string(
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sit enim, sed volutpat vitae ultrices vulputate. Et quis.",
      )}
    </Paragraph>
    <div className="grid grid-cols-3 gap-5">
      {words
      ->Array.mapWithIndex((index, word) => {
        <MnemonicWordInput
          key={`${Int.toString(index)}-${word}`}
          value=word
          onChange={_ => ()}
          readOnly=true
          number={index + 1}
        />
      })
      ->React.array}
    </div>
    <div className="self-stretch mt-7.5 flex justify-between">
      <Anchor color=#yellow label="Download backup" href=downloadUrl download="anoma.txt" />
      <TextButton color=#yellow label="Copy to clipboard" onClick=copyToClipboard />
    </div>
    <Button className="mt-15" label="I wrote down my mnemonic" color=#yellow onClick=proceed />
  </React.Fragment>
}
