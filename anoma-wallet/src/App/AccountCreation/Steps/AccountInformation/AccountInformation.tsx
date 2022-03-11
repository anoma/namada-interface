import React from "react";
import { Button } from "components/Button";
import {
  AccountInformationViewContainer,
  AccountInformationViewUpperPartContainer,
  AccountInformationForm,
  Header1,
  Header3,
  Header5,
  BodyText,
  Input,
  InputFeedback,
  InputContainer,
  ButtonContainer,
  RecoveryPhraseLengthRadioButton,
  RecoveryPhraseLengthRadioButtonContainer,
  RecoveryPhraseLengthRadioButtonsContainer,
  RecoveryPhraseLengthContainer,
} from "./AccountInformation.components";

// this is being used:
// to store the data in the parent when editing
// when submitting the form
export type AccountCreationDetails = {
  seedPhraseLength?: string;
  accountName?: string;
  password?: string;
};

// the data of this form
type AccountInformationViewProps = {
  accountCreationDetails?: AccountCreationDetails;
  onSubmitAccountCreationDetails: (
    accountCreationDetails: AccountCreationDetails
  ) => void;
  onSetAccountCreationDetails: (
    accountCreationDetails: AccountCreationDetails
  ) => void;
  onCtaHover: () => void;
};

const AccountInformation = (
  props: AccountInformationViewProps
): JSX.Element => {
  const {
    onSubmitAccountCreationDetails,
    onSetAccountCreationDetails,
    onCtaHover,
    accountCreationDetails,
  } = props;

  // setting these default values if no data was passed
  const { seedPhraseLength = "12", accountName = "" } =
    accountCreationDetails || {};

  // we store passwords locally as we would not like to pass them in
  // when the user switches between the screens
  const [password1, setPassword1] = React.useState("");
  const [password2, setPassword2] = React.useState("");
  const [password2Feedback, setPassword2Feedback] = React.useState("");
  const [password1Feedback, setPassword1Feedback] = React.useState("");

  const isSubmitButtonDisabled =
    accountName === "" || password1 === "" || password1 !== password2;

  return (
    <AccountInformationViewContainer>
      {/* header */}
      <AccountInformationViewUpperPartContainer>
        <Header1>Create an account using file-based keys</Header1>
      </AccountInformationViewUpperPartContainer>

      {/* form */}
      <AccountInformationForm>
        {/* seed phrase */}
        <RecoveryPhraseLengthContainer>
          <Header3>Recovery Phrase</Header3>

          {/* seed phrase */}
          <RecoveryPhraseLengthRadioButtonsContainer>
            <RecoveryPhraseLengthRadioButtonContainer>
              <RecoveryPhraseLengthRadioButton
                type="radio"
                name="seedPhraseLength"
                value={"12"}
                onChange={(event) => {
                  onSetAccountCreationDetails({
                    seedPhraseLength: event.target.value,
                  });
                }}
                checked={seedPhraseLength === "12"}
              />
              <label htmlFor="seedPhraseLength">12</label>
            </RecoveryPhraseLengthRadioButtonContainer>

            <RecoveryPhraseLengthRadioButtonContainer>
              <RecoveryPhraseLengthRadioButton
                type="radio"
                name="seedPhraseLength"
                value={"24"}
                checked={seedPhraseLength === "24"}
                onChange={(event) => {
                  onSetAccountCreationDetails({
                    seedPhraseLength: event.target.value,
                  });
                }}
              />
              <label htmlFor="seedPhraseLength">24</label>
            </RecoveryPhraseLengthRadioButtonContainer>
          </RecoveryPhraseLengthRadioButtonsContainer>
        </RecoveryPhraseLengthContainer>

        {/* description */}
        <BodyText>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Enim augue
          aenean facilisi placerat laoreet sem faucibus{" "}
        </BodyText>

        {/* account name */}
        <InputContainer>
          <Header5>Account Name</Header5>
          <Input
            value={accountName}
            onChange={(event) => {
              onSetAccountCreationDetails({ accountName: event.target.value });
            }}
          />
        </InputContainer>

        {/* password 1 */}
        <InputContainer>
          <Header5>Create password</Header5>
          <Input
            value={password1}
            onChange={(event) => {
              setPassword1(event.target.value);
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
            onFocus={(event) => {
              setPassword1Feedback("");
              setPassword2Feedback("");
            }}
            onBlur={() => {
              if (password2 === "") {
                setPassword2Feedback("password cannot be empty");
              }
              if (password1 !== password2) {
                setPassword2Feedback("passwords are not matching");
              }
            }}
          />
          <InputFeedback>{password2Feedback}</InputFeedback>
        </InputContainer>

        {/* submit */}
        <ButtonContainer>
          <Button
            onClick={() => {
              if (!isSubmitButtonDisabled) {
                const accountCreationDetailsToSubmit: AccountCreationDetails = {
                  ...accountCreationDetails,
                  password: password1,
                };
                onSubmitAccountCreationDetails(accountCreationDetailsToSubmit);
              }
            }}
            onHover={onCtaHover}
            disabled={isSubmitButtonDisabled}
          >
            Create an Account
          </Button>
        </ButtonContainer>
      </AccountInformationForm>
    </AccountInformationViewContainer>
  );
};

export default AccountInformation;
