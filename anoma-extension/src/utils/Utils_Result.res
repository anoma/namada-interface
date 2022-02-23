let fromOption = (opt, defaultError) => {
  Option.mapWithDefault(opt, defaultError, value => Ok(value))
}

let toOption = result => {
  Result.mapWithDefault(result, None, value => Some(value))
}
