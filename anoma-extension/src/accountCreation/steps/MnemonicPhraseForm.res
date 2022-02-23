type error =
  | EmptyPassword
  | PasswordsDontMatch

type state = {
  name: string,
  password: string,
  passwordConfirmation: string,
  size: Anoma.Keypair.phraseSize,
  error: option<error>,
}

type field =
  | Name
  | Password
  | PasswordConfirmation

type action =
  | ChangeField(field, string)
  | SetSize(Anoma.Keypair.phraseSize)
  | SetError(option<error>)

let reducer = (state, action) => {
  switch action {
  | ChangeField(Name, name) => {...state, name: name}
  | ChangeField(Password, password) => {...state, password: password}
  | ChangeField(PasswordConfirmation, passwordConfirmation) => {
      ...state,
      passwordConfirmation: passwordConfirmation,
    }
  | SetSize(size) => {...state, size: size}
  | SetError(error) => {...state, error: error}
  }
}

let getError = ({password, passwordConfirmation}) => {
  switch password {
  | "" => Some(EmptyPassword)
  | password if password != passwordConfirmation => Some(PasswordsDontMatch)
  | _ => None
  }
}

let initialState = {
  name: "",
  password: "",
  passwordConfirmation: "",
  size: #12,
  error: None,
}

@react.component
let make = (~proceed) => {
  let ({name, password, passwordConfirmation, error, size} as state, dispatch) = React.useReducer(
    reducer,
    initialState,
  )

  let onChange = (field, evt) => {
    let value = ReactEvent.Form.currentTarget(evt)["value"]

    dispatch(ChangeField(field, value))
  }

  let select = (phraseSize: Anoma.Keypair.phraseSize, _evt) => {
    dispatch(SetSize(phraseSize))
  }

  let validate = evt => {
    ReactEvent.Form.preventDefault(evt)

    switch getError(state) {
    | Some(_) as e => dispatch(SetError(e))
    | None => {
        let phrase = Anoma.Keypair.generateMnemonic(size)

        let name = switch name {
        | "" => "Account #1"
        | name => name
        }

        proceed(phrase, name, size, password)
      }
    }
  }

  <React.Fragment>
    <Heading level=#3 className="mt-3.5 mb-8 text-black">
      {React.string("Create an account using file-based keys")}
    </Heading>
    <div className="self-stretch flex items-center justify-start mb-3.5">
      <Heading className="mr-auto" level=#5> {React.string("Recovery Phrase")} </Heading>
      <SmallButton className="mr-5" onClick={select(#12)} label="12 words" active={size == #12} />
      <SmallButton onClick={select(#24)} label="24 words" active={size == #24} />
    </div>
    <Paragraph className="text-left mb-3.5">
      {React.string(
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Enim augue aenean facilisi placerat laoreet sem faucibus ",
      )}
    </Paragraph>
    <form onSubmit={validate} className="flex flex-col self-stretch">
      <Input label="Account name" id="name" value=name onChange={onChange(Name)} className="mb-6" />
      <PasswordInput
        label="Create Password"
        id="password"
        value=password
        onChange={onChange(Password)}
        className="mb-6"
        error={error == Some(EmptyPassword) ? Some("Password cannot be empty") : None}
      />
      <PasswordInput
        label="Confirm password"
        id="confirm-password"
        value=passwordConfirmation
        onChange={onChange(PasswordConfirmation)}
        className="mb-6"
        error={error == Some(PasswordsDontMatch) ? Some("The passwords do not match") : None}
      />
      <Button className="self-center mt-10" label="Next" color=#yellow />
    </form>
  </React.Fragment>
}
