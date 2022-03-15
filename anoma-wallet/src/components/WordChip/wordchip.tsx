import { NumberContainer, TextContainer, WordChipContainer } from "./wordchip.components";

export type WordchipProps = {
    number: string;
    text: string;
    style?: React.CSSProperties;
}

export const Wordchip = (props: WordchipProps): JSX.Element => {
    return (
    <WordChipContainer style={props.style}>
        <NumberContainer>{props.number}</NumberContainer>
        <TextContainer>{props.text}</TextContainer>
    </WordChipContainer>
    );
}
