import { GoArrowLeft } from "react-icons/go";
import {
  MainRow,
  NavigationContainerContainer,
} from "./NavigationContainer.components";

type NavigationContainerProps = {
  // the content of the header TODO: change this to string once the designs are final
  children: React.ReactElement;

  // this will be called at back button press, if not passed no button rendered
  onBackButtonClick?: () => void;
};

/**
 * This is a generic component that has only one purpose, to be the header/navigation row in the
 * container displaying the page content. Likely we should include this with a new component that
 * packs more functionality once the designs are more final:
 *   * this header
 *   * the whole container
 *   * the navigating with animations
 *
 * This had 2 modes,
 *   1. if onBackButtonClick is passed, there will be a back button.
 *   2. otherwise renders without back button and the header is centered
 */
export const NavigationContainer = (
  props: NavigationContainerProps
): React.ReactElement => {
  const { children, onBackButtonClick } = props;
  const noButton = typeof onBackButtonClick === "undefined";
  return (
    <NavigationContainerContainer>
      <MainRow center={noButton}>
        {onBackButtonClick && (
          <i
            className="cursor-pointer text-yellow text-[22px]"
            onClick={onBackButtonClick}
            style={{ marginLeft: "0" }}
          >
            <GoArrowLeft />
          </i>
        )}

        {children}
      </MainRow>
    </NavigationContainerContainer>
  );
};
