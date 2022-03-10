/* eslint-disable max-len */
import { ContainedAltButton, ContainedButton, OutlinedButton, SmallButton } from "./button.components";
import { ButtonStyle } from "./types"

export type ButtonProps = {
    variant: ButtonStyle;
    onClick?: React.MouseEventHandler<HTMLButtonElement>
}
export const Button: React.FC<ButtonProps> = (props): JSX.Element => {
    switch(props.variant) {
        case ButtonStyle.Contained:
            return <ContainedButton onClick={props.onClick}>{props.children}</ContainedButton>
        case ButtonStyle.ContainedAlternative:
            return <ContainedAltButton onClick={props.onClick} >{props.children}</ContainedAltButton>
        case ButtonStyle.Outlined:
            return <OutlinedButton onClick={props.onClick} >{props.children}</OutlinedButton>
        case ButtonStyle.Small:
            return <SmallButton onClick={props.onClick} >{props.children}</SmallButton>
    }
}
