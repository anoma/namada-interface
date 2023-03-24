import React, { useState } from "react";
import zxcvbn from "zxcvbn";

import { Button, ButtonVariant } from "@anoma/components";

import {
  BodyText,
  ButtonsContainer,
  FormContainer,
  Header1,
  Header5,
  UpperContentContainer,
  SubViewContainer,
  InputContainer,
} from "Setup/Setup.components";
import { AccountDetails } from "Setup/types";
import { Input, InputFeedback } from "./Password.components";

// the data of this form
type Props = {
  // if the user navigates back and forth this might be there
  accountCreationDetails?: AccountDetails;
  onSubmitAccountCreationDetails: (
    accountCreationDetails: AccountDetails
  ) => void;

  onSetAccountCreationDetails: (accountCreationDetails: AccountDetails) => void;
};

const validatePassword = (
  { warning, suggestions }: zxcvbn.ZXCVBNFeedback,
  password: string,
  passwordMatch: string
): boolean => {
  return process.env.NODE_ENV === "development"
    ? password.length > 0 && password === passwordMatch
    : warning === "" && suggestions.length === 0 && password === passwordMatch;
};

const Password: React.FC<Props> = (props) => {
  const { onSubmitAccountCreationDetails, accountCreationDetails } = props;

  // we store passwords locally as we would not like to pass them in
  // when the user switches between the screens
  const [password, setPassword] = useState("");
  const [passwordMatch, setPasswordMatch] = useState("");
  const [passwordMatchFeedback, setPasswordMatchFeedback] = useState("");
  const [zxcvbnFeedback, setZxcvbnFeedback] = useState(zxcvbn("").feedback);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alias, setAlias] = useState<string>();
  const isPasswordValid = validatePassword(
    zxcvbnFeedback,
    password,
    passwordMatch
  );

  return (
    <SubViewContainer>
      {/* header */}
      <UpperContentContainer>
        <Header1>Set a Passcode for your wallet</Header1>
      </UpperContentContainer>

      {/* form */}
      <FormContainer>
        {/* seed phrase */}
        {/* description */}
        <BodyText>
          <strong>NOT</strong> a replacement for your seed phrase! Use this
          password to access your wallet in the browser.
        </BodyText>

        <InputContainer>
          <Header5>Alias</Header5>
          <Input value={alias} onChange={(e) => setAlias(e.target.value)} />
        </InputContainer>

        {/* password 1 */}
        <InputContainer>
          <Header5>Create password</Header5>
          <Input
            value={password}
            onChange={(event) => {
              const { value } = event.target;
              setPassword(value);
            }}
            onBlur={() => {
              const { feedback } = zxcvbn(password);
              setZxcvbnFeedback(feedback);

              if (passwordMatch !== "" && password !== passwordMatch) {
                setPasswordMatchFeedback("Passwords are not matching");
              } else {
                setPasswordMatchFeedback("");
              }
            }}
            type="password"
          />
          <InputFeedback className="warning">
            {zxcvbnFeedback.warning}
          </InputFeedback>
          {zxcvbnFeedback.suggestions.map(
            (suggestion: string, index: number) => (
              <InputFeedback key={index}>{suggestion}</InputFeedback>
            )
          )}
        </InputContainer>

        {/* password 2 */}
        <InputContainer>
          <Header5>Confirm password</Header5>
          <Input
            type="password"
            value={passwordMatch}
            onChange={(event) => {
              setPasswordMatch(event.target.value);
            }}
            onBlur={() => {
              if (password !== passwordMatch) {
                setPasswordMatchFeedback("Passwords are not matching");
              } else {
                setPasswordMatchFeedback("");
              }
            }}
          />
          <InputFeedback>{passwordMatchFeedback}</InputFeedback>
          {isSubmitting && <p>Initializing wallet store...</p>}
        </InputContainer>

        {/* submit */}
        <ButtonsContainer>
          <Button
            variant={ButtonVariant.Contained}
            onClick={() => {
              if (isPasswordValid && alias && !isSubmitting) {
                setIsSubmitting(true);
                const accountCreationDetailsToSubmit: AccountDetails = {
                  ...accountCreationDetails,
                  alias,
                  password,
                };

                // Wait a moment for setStore to finish, then navigate
                // so as not to block animations
                onSubmitAccountCreationDetails(accountCreationDetailsToSubmit);
              }
            }}
            disabled={!isPasswordValid || !alias}
          >
            Create an Account
          </Button>
        </ButtonsContainer>
      </FormContainer>
    </SubViewContainer>
  );
};

export default Password;
