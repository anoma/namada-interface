import { Icon, IconName } from "components/Icon";
import { ChangeEventHandler, useState } from "react";
import { ErrorTooltip, IconContainer, Label, PasswordContainer, TextAreaInput, TextInput } from "./input.components";
import { InputVariants } from "./types"

export type InputProps = {
    variant: InputVariants;
    label: string;
    error?: string;
    onChangeCallback?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>
    placeholder?: string;
}

export const Input = (props: InputProps): JSX.Element => {
    const [passwordShown, setPasswordShown] = useState(false);
    const togglePasswordShown = (): void => setPasswordShown(!passwordShown);

    switch (props.variant) {
        case InputVariants.Text:
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
        case InputVariants.Password:
            return (
               <Label>
                   {props.label}
                   <PasswordContainer>
                        <TextInput
                            error={!!props.error} 
                            placeholder={props.placeholder} 
                            onChange={props.onChangeCallback} 
                            type={passwordShown ? "text" : "password"} />
                        <IconContainer onClick={(_) => togglePasswordShown()} >
                            <Icon iconName={passwordShown ?
                                IconName.Eye : IconName.EyeHidden}/>
                        </IconContainer> 
                   </PasswordContainer>
               </Label>
            )
    }
}
