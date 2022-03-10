import { ChangeEventHandler } from "react";
import { ErrorTooltip, Label, TextAreaInput, TextInput } from "./input.component";
import { InputVariants } from "./types"

export type InputProps = {
    variant: InputVariants;
    label: string;
    error?: string;
    onChangeCallback?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>
    placeholder?: string;
}

export const Input = (props: InputProps): JSX.Element => {
    switch (props.variant) {
        case InputVariants.Text:
            console.log(props.error)
            console.log(!!props.error)
            return (
                <Label>
                    {props.label}
                    <div>
                        <TextInput error={!!props.error} 
                        onChange={props.onChangeCallback}
                        placeholder={props.placeholder} /><br />
                        <ErrorTooltip>{props.error}</ErrorTooltip>
                    </div>
                </Label>
            )
        case InputVariants.Textarea:
            return (
                <Label>
                    {props.label}<br />
                    <TextAreaInput error={!!props.error} 
                    onChange={props.onChangeCallback} /><br />
                    <ErrorTooltip>{props.error}</ErrorTooltip>
                </Label>
            )
    }
}
