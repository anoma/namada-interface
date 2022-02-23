type t

type options = {
  @as("type")
  type_: [#"text/plain"],
}

@new
external make: (array<'a>, options) => t = "Blob"

@scope(("window", "URL")) @val
external createURL: t => string = "createObjectURL"
