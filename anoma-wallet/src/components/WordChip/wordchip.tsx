import { NumberContainer, TextContainer, WordChipContainer } from "./wordchip.components";

export type WordchipProps = {
    number: string;
    text: string;
}

export const Wordchip = (props: WordchipProps): JSX.Element => {
    return (
    <WordChipContainer>
        <NumberContainer>{props.number}</NumberContainer>
        <TextContainer>{props.text}</TextContainer>
    </WordChipContainer>
    );
}
