/* eslint-disable max-len */
import { ContainedAltButton, ContainedButton, OutlinedButton, SmallButton } from "./button.components";
import { ButtonVariant } from "./types"

export type ButtonProps = {
    variant: ButtonVariant;
    onClick?: React.MouseEventHandler<HTMLButtonElement>
}
export const Button: React.FC<ButtonProps> = (props): JSX.Element => {
    switch(props.variant) {
        case ButtonVariant.Contained:
            return <ContainedButton onClick={props.onClick}>{props.children}</ContainedButton>
        case ButtonVariant.ContainedAlternative:
            return <ContainedAltButton onClick={props.onClick} >{props.children}</ContainedAltButton>
        case ButtonVariant.Outlined:
            return <OutlinedButton onClick={props.onClick} >{props.children}</OutlinedButton>
        case ButtonVariant.Small:
            return <SmallButton onClick={props.onClick} >{props.children}</SmallButton>
    }
}
