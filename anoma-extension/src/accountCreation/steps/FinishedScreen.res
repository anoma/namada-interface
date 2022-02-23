@react.component
let make = () => {
  let close = _ => Window.close()

  <React.Fragment>
    <ReactFeather.Check size=100 className="bg-green-confirm rounded-full p-2 mb-15 mt-16" />
    <Heading level=#2 className="mb-3.5"> {React.string("You are all set!")} </Heading>
    <Paragraph className="text-center text-grey-light font-display font-medium leading-4">
      {React.string(
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla maecenas sed bibendum sed velit. Consequat bibendum nibh netus sed erat sed.",
      )}
    </Paragraph>
    <div className="grid grid-cols-2 justify-between w-full gap-36 mt-24">
      <Button color=#blue style=#outlined label="Done" onClick=close />
      <Button color=#yellow style=#filled label="See Account" />
    </div>
  </React.Fragment>
}
