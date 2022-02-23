let mapOk: (Promise.t<result<'a, 'error>>, 'a => Promise.t<'b>) => Promise.t<result<'b, 'error>>

let flatMapOk: (
  Promise.t<result<'a, 'error>>,
  'a => Promise.t<result<'b, 'error>>,
) => Promise.t<result<'b, 'error>>

let mapError: (Promise.t<result<'ok, 'a>>, 'a => Promise.t<'b>) => Promise.t<result<'ok, 'b>>

let catchAsResult: (
  Promise.t<'ok>,
  exn => Promise.t<result<'ok, 'error>>,
) => Promise.t<result<'ok, 'error>>

let done: Promise.t<'a> => unit
