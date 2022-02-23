type t = {url: string}

@scope(("browser", "tabs")) @val
external create: t => Promise.t<unit> = "create"
