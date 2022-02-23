@react.component
let make = (~value, ~onChange, ~number, ~readOnly=false, ~error=false, ~autoFocus=false) => {
  let className = Cn.make([
    "px-3 py-2.5 border rounded-lg flex focus-within:border-yellow focus-within:ring-1 ring-yellow -base",
    error ? "border-red" : "border-grey-light",
  ])
  <span className>
    <span className="mr-2 font-display font-medium text-sm text-grey-light">
      {React.string(Int.toString(number))}
    </span>
    <input
      className="font-display font-medium text-sm text-blue-dark w-full active:outline-none focus:outline-none"
      value
      onChange
      readOnly
      autoFocus
    />
  </span>
}
