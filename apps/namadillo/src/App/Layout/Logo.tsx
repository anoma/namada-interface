import logoEyeClosedImage from "App/Assets/LogoEyeClosed.svg";
import logoEyeOpenImage from "App/Assets/LogoEyeOpen.svg";

type LogoProps = {
  eyeOpen: boolean;
};

export const Logo = ({ eyeOpen }: LogoProps): JSX.Element => {
  if (eyeOpen) {
    return <img src={logoEyeOpenImage} />;
  }
  return <img src={logoEyeClosedImage} />;
};
