@react.component
let make = (~onClick) => {
  <React.Fragment>
    <div className="mt-7.5" ariaHidden=true />
    <AnomaIcon width="90px" height="90px" />
    <Heading level=#3 className="mt-16 mb-8 text-black max-w-xs">
      {React.string("Welcome to the Anoma Extension")}
    </Heading>
    <Paragraph className="text-center mb-16">
      {React.string(
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Enim augue aenean facilisi placerat laoreet sem faucibus curabitur. Posuere ut porttitor eu auctor eu. Aenean faucibus non eleifend neque ullamcorper viverra amet. ",
      )}
    </Paragraph>
    <Button label="Get Started" color=#yellow onClick />
  </React.Fragment>
}
