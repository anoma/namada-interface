import { ContainerSize } from "@namada/utils";
import {
  ContainerBody,
  ContainerWrapper,
  Header,
  Page,
} from "./Container.components";
import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

type ContainerProps = {
  children: React.ReactNode;
  onReturn?: () => void;
  size?: keyof ContainerSize;
  header?: React.ReactNode;
};

export const Container = (props: ContainerProps): JSX.Element => {
  const location = useLocation();
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <Page isPopup={props.size === "popup"}>
      <ContainerWrapper maxW={props.size || "md"}>
        {(props.header || props.onReturn) && <Header>{props.header}</Header>}
        <ContainerBody>{props.children}</ContainerBody>
      </ContainerWrapper>
    </Page>
  );
};
