import { ExternalPageIcon } from "App/Icons/ExternalPageIcon";
import {
  PageFooterContainer,
  PageFooterContent,
} from "./PageFooter.components";

export const PageFooter = (): JSX.Element => {
  return (
    <PageFooterContainer>
      <PageFooterContent>
        <div>Privacy is a Public Good</div>
        <a
          href="https://namada.net/vision"
          target="_blank"
          rel="nofollow noreferrer"
        >
          The Namada Vision
          <i className="external-icon">
            <ExternalPageIcon />
          </i>
        </a>
      </PageFooterContent>
    </PageFooterContainer>
  );
};
