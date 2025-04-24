import { useEffect, useState } from "react";
import zxcvbn from "zxcvbn";

import { Input } from "@namada/components";

// the data of this form
type PasswordProps = {
  onValidPassword: (password: string | undefined) => void;
  "data-testid"?: string;
};

const validatePassword = (
  { warning, suggestions }: zxcvbn.ZXCVBNFeedback,
  password: string,
  passwordMatch: string
): boolean => {
  return process.env.NODE_ENV === "development" ?
      password.length > 0 && password === passwordMatch
    : warning === "" && suggestions.length === 0 && password === passwordMatch;
};

export const Password = ({
  onValidPassword,
  "data-testid": dataTestId,
}: PasswordProps): JSX.Element => {
  // we store passwords locally as we would not like to pass them in
  // when the user switches between the screens
  const [password, setPassword] = useState("");
  const [passwordMatch, setPasswordMatch] = useState("");
  const [passwordMatchFeedback, setPasswordMatchFeedback] = useState("");
  const [zxcvbnFeedback, setZxcvbnFeedback] = useState(zxcvbn("").feedback);

  useEffect(() => {
    const isPasswordValid = validatePassword(
      zxcvbnFeedback,
      password,
      passwordMatch
    );

    if (isPasswordValid) {
      onValidPassword(password);
    } else {
      onValidPassword(undefined);
    }
  }, [password, passwordMatch, zxcvbnFeedback]);

  const verifyPasswordMatch = (
    passwordValue: string,
    confirmValue: string
  ): void => {
    if (confirmValue !== "" && passwordValue !== confirmValue) {
      setPasswordMatchFeedback("Passwords are not matching");
    } else {
      setPasswordMatchFeedback("");
    }
  };

  const checkPasswordErrors = (password: string): void => {
    const { feedback } = zxcvbn(password);
    setZxcvbnFeedback(feedback);
    verifyPasswordMatch(password, passwordMatch);
  };

  const displayError =
    zxcvbnFeedback.warning ?
      zxcvbnFeedback.warning
    : zxcvbnFeedback.suggestions.length > 0 &&
      zxcvbnFeedback.suggestions.map((suggestion: string, index: number) => (
        <div key={`input-feedback-${index}`}>{suggestion}</div>
      ));

  return (
    <>
      <Input
        data-testid={dataTestId}
        label="Create Extension Password"
        variant="Password"
        value={password}
        error={password.length > 0 ? displayError : ""}
        placeholder="At least 8 characters"
        onChange={(e) => {
          const newPassword = e.target.value;
          setPassword(newPassword);
          checkPasswordErrors(newPassword);
        }}
        onBlur={() => {
          checkPasswordErrors(password);
        }}
      />

      <Input
        data-testid={dataTestId}
        label="Confirm Extension Password"
        placeholder="At least 8 characters"
        variant="Password"
        value={passwordMatch}
        error={passwordMatchFeedback}
        onChange={(event) => {
          const newConfirmValue = event.target.value;
          setPasswordMatch(newConfirmValue);
          verifyPasswordMatch(password, newConfirmValue);
        }}
        onBlur={() => {
          verifyPasswordMatch(password, passwordMatch);
        }}
        onFocus={() => {
          if (passwordMatch) {
            verifyPasswordMatch(password, passwordMatch);
          }
        }}
      />
    </>
  );
};
