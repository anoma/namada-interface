@react.component
let make = () => {
  <div className="p-4 rounded-2xl flex flex-col items-center w-96">
    <ReactFeather.Check size=100 className="bg-green-confirm rounded-full p-2 mb-2" />
    <Heading level=#2 className="mb-3.5">
      {React.string("You have created your account!")}
    </Heading>
  </div>
}
