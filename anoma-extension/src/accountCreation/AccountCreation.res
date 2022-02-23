type mnemonicInfo = {
  name: string,
  phrase: Anoma.Keypair.mnemonicPhrase,
  size: Anoma.Keypair.phraseSize,
  password: string,
}

type state =
  | Welcome
  | CreateNewAccount
  | MnemonicPhraseForm
  | MnemonicPhrase(mnemonicInfo)
  | MnemonicValidation(mnemonicInfo)
  | Finished

type action = Next | GoBack | SetPhraseInfo(mnemonicInfo)

%%private(
  let reducer = (state, action) => {
    switch action {
    | Next =>
      switch state {
      | Welcome => CreateNewAccount
      | CreateNewAccount => MnemonicPhraseForm
      | MnemonicPhrase(info) => MnemonicValidation(info)
      | MnemonicValidation(_) => Finished
      | Finished => Finished
      | page => page
      }
    | GoBack =>
      switch state {
      | Welcome => Welcome
      | CreateNewAccount => Welcome
      | MnemonicPhraseForm => CreateNewAccount
      | MnemonicPhrase(_) => MnemonicPhraseForm
      | MnemonicValidation(info) => MnemonicPhrase(info)
      | Finished => Finished
      }
    | SetPhraseInfo(info) =>
      switch state {
      | MnemonicPhraseForm => MnemonicPhrase(info)
      | page => page
      }
    }
  }
)

@react.component
let make = () => {
  let (state, dispatch) = React.useReducer(reducer, Welcome)

  let proceed = _ => dispatch(Next)

  let goBack = _ => dispatch(GoBack)

  <React.Fragment>
    <Navbar />
    <main className="mx-auto flex flex-col items-center mb-8">
      <MenuCard className="w-120 p-7.5 pb-15 flex flex-col items-center justify-start">
        {switch state {
        | Welcome
        | Finished => React.null
        | _ =>
          <IconButton
            onClick=goBack icon=#ChevronLeft size=26 ariaLabel="Go back" className="self-start"
          />
        }}
        {switch state {
        | Welcome => <WelcomeScreen onClick=proceed />
        | CreateNewAccount => <CreateAccount onClick=proceed />
        | MnemonicPhraseForm =>
          <MnemonicPhraseForm
            proceed={(phrase, name, size, password) =>
              dispatch(SetPhraseInfo({name: name, phrase: phrase, size: size, password: password}))}
          />
        | MnemonicPhrase({phrase}) => <MnemonicPhrase phrase proceed />
        | MnemonicValidation({phrase, size, name, password}) =>
          <MnemonicPhraseValidation phrase proceed size name password />
        | Finished => <FinishedScreen />
        }}
      </MenuCard>
    </main>
  </React.Fragment>
}
