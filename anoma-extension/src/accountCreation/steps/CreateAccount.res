@genType @react.component
let make = (~onClick) => {
  <React.Fragment>
    <Heading level=#3 className="mt-15 mb-8 text-black">
      {React.string("Create a new account")}
    </Heading>
    <Paragraph className="text-left mb-7.5">
      {React.string(
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Enim augue aenean facilisi placerat laoreet sem faucibus curabitur. Posuere ut porttitor eu auctor eu. Aenean faucibus non eleifend neque ullamcorper viverra amet. ",
      )}
    </Paragraph>
    <Button className="self-center mt-15" label="Create an Account" color=#yellow onClick />
  </React.Fragment>
}
