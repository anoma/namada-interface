let mapOk = (promise, f) => {
  Promise.then(promise, value => {
    switch value {
    | Error(error) => Promise.resolve(Error(error))
    | Ok(value) => f(value)->Promise.thenResolve(result => Ok(result))
    }
  })
}

let flatMapOk = (promise, f) => {
  Promise.then(promise, value => {
    switch value {
    | Error(error) => Promise.resolve(Error(error))
    | Ok(value) => f(value)
    }
  })
}

let mapError = (promise, f) => {
  Promise.then(promise, value => {
    switch value {
    | Error(error) => f(error)->Promise.thenResolve(result => Error(result))
    | Ok(value) => Promise.resolve(Ok(value))
    }
  })
}

let catchAsResult = (promise, f) => {
  Promise.thenResolve(promise, value => Ok(value))->Promise.catch(err => {
    Js.Console.error(err)
    f(err)
  })
}

let done = _ => {
  ()
}
