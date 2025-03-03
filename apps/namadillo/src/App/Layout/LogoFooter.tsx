import logoFooterImage from "App/Assets/LogoFooter.svg";

export const LogoFooter = ({
  className,
}: {
  className?: string;
}): JSX.Element => {
  return <img src={logoFooterImage} className={className} />;
};
