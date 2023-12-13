import { ContainerSize } from "@namada/utils";
import {
  ContainerBody,
  ContainerWrapper,
  Header,
  Page,
} from "./Container.components";

type ContainerProps = {
  children: React.ReactNode;
  onReturn?: () => void;
  size?: keyof ContainerSize;
  header?: React.ReactNode;
};

export const Container = (props: ContainerProps): JSX.Element => {
  return (
    <Page isPopup={props.size === "popup"}>
      <ContainerWrapper maxW={props.size || "md"}>
        {(props.header || props.onReturn) && <Header>{props.header}</Header>}
        <ContainerBody>{props.children}</ContainerBody>
      </ContainerWrapper>
    </Page>
  );
};
