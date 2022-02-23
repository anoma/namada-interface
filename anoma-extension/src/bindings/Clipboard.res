@scope(("navigator", "clipboard")) @val
external writeText: string => Promise.t<unit> = "writeText"
