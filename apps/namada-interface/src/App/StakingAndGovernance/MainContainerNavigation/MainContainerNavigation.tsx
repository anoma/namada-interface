import { Icon } from "@namada/components";
import {
  BackButtonContainer,
  MainContainerNavigationContainer,
  MainTitle,
  SecondaryTitle,
  TitleContainer,
} from "./MainContainerNavigation.components";

type Props = {
  breadcrumbs: string[];
  navigateBack?: () => void;
};

// this contains the logic for correct title, either single title
// or breadcrumb
const getRenderedTitle = (breadcrumbs: string[]): JSX.Element => {
  if (breadcrumbs.length <= 1) {
    return <MainTitle center>{breadcrumbs[0]}</MainTitle>;
  }

  return (
    <>
      <SecondaryTitle>{breadcrumbs[breadcrumbs.length - 2]}</SecondaryTitle>
      <Icon name="ChevronRight" />
      <MainTitle>{breadcrumbs[breadcrumbs.length - 1]}</MainTitle>
    </>
  );
};

// creates a simple header containing simple title or a back button
// that accepts a callback and an array that creates a breadcrumb from
// the last 2 items of the array
export const MainContainerNavigation = (props: Props): JSX.Element => {
  const { breadcrumbs, navigateBack } = props;
  const isBackButtonVisible = breadcrumbs.length > 1;
  const renderedTitle = getRenderedTitle(breadcrumbs);

  return (
    <MainContainerNavigationContainer>
      <BackButtonContainer
        onClick={() => {
          navigateBack && navigateBack();
        }}
      >
        {isBackButtonVisible && (
          <>
            <Icon name="ChevronLeft" />
            <span>Back</span>
          </>
        )}
      </BackButtonContainer>

      <TitleContainer>{renderedTitle}</TitleContainer>
      <BackButtonContainer disabled></BackButtonContainer>
    </MainContainerNavigationContainer>
  );
};
