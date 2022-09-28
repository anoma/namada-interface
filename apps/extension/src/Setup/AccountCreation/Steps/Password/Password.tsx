import React, { useState } from "react";
import { Button, ButtonVariant } from "@anoma/components";
import {
  AccountInformationViewContainer,
  AccountInformationViewUpperPartContainer,
  AccountInformationForm,
  Header1,
  Header5,
  BodyText,
  Input,
  InputFeedback,
  InputContainer,
  ButtonContainer,
} from "./Password.components";
import { AccountCreationDetails } from "Setup/AccountCreation/types";

// the data of this form
type Props = {
  // if the user navigates back and forth this might be there
  accountCreationDetails?: AccountCreationDetails;
  onSubmitAccountCreationDetails: (
    accountCreationDetails: AccountCreationDetails
  ) => void;

  onSetAccountCreationDetails: (
    accountCreationDetails: AccountCreationDetails
  ) => void;
};

const Password: React.FC<Props> = (props) => {
  const { onSubmitAccountCreationDetails, accountCreationDetails } = props;

  // we store passwords locally as we would not like to pass them in
  // when the user switches between the screens
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [password2Feedback, setPassword2Feedback] = useState("");
  const [password1Feedback, setPassword1Feedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alias, setAlias] = useState("");

  const isSubmitButtonDisabled = password1 === "" || password1 !== password2;

  return (
    <AccountInformationViewContainer>
      {/* header */}
      <AccountInformationViewUpperPartContainer>
        <Header1>Set a Passcode for your wallet</Header1>
      </AccountInformationViewUpperPartContainer>

      {/* form */}
      <AccountInformationForm>
        {/* seed phrase */}
        {/* description */}
        <BodyText>
          <strong>NOT</strong> a replacement for your seed phrase! Use this
          password to access your wallet in the browser.
        </BodyText>

        <InputContainer>
          <Header5>Alias (optional)</Header5>
          <Input value={alias} onChange={(e) => setAlias(e.target.value)} />
        </InputContainer>

        {/* password 1 */}
        <InputContainer>
          <Header5>Create password</Header5>
          <Input
            value={password1}
            onChange={(event) => {
              const { value } = event.target;
              setPassword1(value);
            }}
            onFocus={() => {
              setPassword1Feedback("");
              setPassword2Feedback("");
            }}
            onBlur={() => {
              if (password1 === "") {
                setPassword1Feedback("password cannot be empty");
              }

              if (password2 !== "" && password1 !== password2) {
                setPassword2Feedback("passwords are not matching");
              }
            }}
            type="password"
          />
          <InputFeedback>{password1Feedback}</InputFeedback>
        </InputContainer>

        {/* password 2 */}
        <InputContainer>
          <Header5>Confirm password</Header5>
          <Input
            type="password"
            value={password2}
            onChange={(event) => {
              setPassword2(event.target.value);
            }}
            onFocus={() => {
              setPassword1Feedback("");
              setPassword2Feedback("");
            }}
            onBlur={() => {
              if (password2 === "") {
                setPassword2Feedback("Password cannot be empty");
              }
              if (password1 !== password2) {
                setPassword2Feedback("Passwords are not matching");
              }
            }}
          />
          <InputFeedback>{password2Feedback}</InputFeedback>
          {isSubmitting && <p>Initializing wallet store...</p>}
        </InputContainer>

        {/* submit */}
        <ButtonContainer>
          <Button
            variant={ButtonVariant.Contained}
            onClick={() => {
              if (!isSubmitButtonDisabled && !isSubmitting) {
                setIsSubmitting(true);
                const accountCreationDetailsToSubmit: AccountCreationDetails = {
                  ...accountCreationDetails,
                  alias,
                  password: password1,
                };

                // Wait a moment for setStore to finish, then navigate
                // so as not to block animations
                onSubmitAccountCreationDetails(accountCreationDetailsToSubmit);
              }
            }}
            disabled={isSubmitButtonDisabled}
          >
            Create an Account
          </Button>
        </ButtonContainer>
      </AccountInformationForm>
    </AccountInformationViewContainer>
  );
};

export default Password;
