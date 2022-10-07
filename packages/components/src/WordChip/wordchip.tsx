import {
  NumberContainer,
  TextContainer,
  WordChipContainer,
} from "./wordchip.components";

export type WordChipProps = {
  number: number;
  text: string;
  style?: React.CSSProperties;
};

export const WordChip = (props: WordChipProps): JSX.Element => {
  return (
    <WordChipContainer style={props?.style}>
      <NumberContainer>{props.number}</NumberContainer>
      <TextContainer>{props.text}</TextContainer>
    </WordChipContainer>
  );
};
