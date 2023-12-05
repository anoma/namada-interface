import { ActionButton } from "@namada/components";
import { GithubIcon } from "App/Icons/GithubIcon";
import { ButtonProps } from "./types";

const {
  NAMADA_INTERFACE_REDIRECT_URI: redirectUrl = "",
  NAMADA_INTERFACE_GITHUB_CLIENT_ID: githubClientId = "",
} = process.env;

export const GithubButton = ({ disabled }: ButtonProps): JSX.Element => {
  return (
    <ActionButton
      outlined
      variant="primary"
      disabled={disabled}
      icon={<GithubIcon />}
      onClick={() => {
        window.open(
          `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${redirectUrl}`,
          "_self"
        );
      }}
    >
      Github
    </ActionButton>
  );
};
