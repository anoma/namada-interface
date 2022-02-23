let fromOption: (option<'ok>, result<'ok, 'error>) => result<'ok, 'error>

let toOption: result<'ok, 'error> => option<'ok>
