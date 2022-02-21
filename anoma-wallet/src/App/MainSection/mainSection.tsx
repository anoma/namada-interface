import {
  MainSectionContainer,
  ImageSectionContainer,
  HeadlineSectionContainer,
  Headline,
  BodyTextContainer,
} from "./styledComponents";
import { Image, ImageName } from "../../components/Image";

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
    </MainSectionContainer>
  );
}

export default MainSection;
