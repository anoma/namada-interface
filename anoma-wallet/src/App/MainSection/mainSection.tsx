import {
  MainSectionContainer,
  ImageSectionContainer,
  HeadlineSectionContainer,
  Headline,
  BodyTextContainer,
} from "./mainSection.components";
import { Image, ImageName } from "components/Image";
import { Input } from "components/Input/input";
import { InputVariants } from "components/Input";
import { Button, ButtonVariant } from "components/Button";
import { Wordchip } from "components/WordChip";

function MainSection(): JSX.Element {
  return (
    <MainSectionContainer>
      <ImageSectionContainer>
        <Image imageName={ImageName.LogoMinimal} />
      </ImageSectionContainer>
      <HeadlineSectionContainer>
        <Headline> SUPER TITLE LINE 1</Headline>
      </HeadlineSectionContainer>
      <BodyTextContainer>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Enim augue
        aenean facilisi placerat laoreet sem faucibus curabitur. Posuere ut
        porttitor eu auctor eu. Aenean faucibus non eleifend neque ullamcorper
        viverra amet.{" "}
      </BodyTextContainer>
      <Input label="senha"/>
    </MainSectionContainer>
  );
}

export default MainSection;
