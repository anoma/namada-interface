let rec traverseHelper = (acc, arr, f) => {
  // Beware: this mutates the array! So `arr` is now the previous' `arr` tail.
  let head = Js.Array2.pop(arr)
  let tail = arr

  switch Option.map(head, f) {
  | None => Ok(acc)
  | Some(Error(err)) => Error(err)
  | Some(Ok(result)) => {
      // Beware: this *also* mutates the array! `push` actually returns an integer,
      // so we just discard the result
      let _ = Js.Array2.push(acc, result)
      traverseHelper(acc, tail, f)
    }
  }
}

let traverse = (arr, f) => {
  traverseHelper([], arr, f)
}
