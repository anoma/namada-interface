import { ActionButton, Input } from "@namada/components";
import { AppContext } from "App/App";
import React, { useContext, useState } from "react";
import { API } from "utils";

const DEFAULT_ENDPOINT = "/api/v1/faucet";
const { NAMADA_INTERFACE_FAUCET_API_ENDPOINT: endpoint = DEFAULT_ENDPOINT } =
  process.env;

export const SettingsForm: React.FC = () => {
  const { api, setApi, setIsModalOpen } = useContext(AppContext)!;
  const [url, setUrl] = useState(api.url);
  const handleFocus = (e: React.ChangeEvent<HTMLInputElement>): void =>
    e.target.select();

  const handleSetApi = (url: string): void => {
    setApi(new API(`${url}${endpoint}`));
    setIsModalOpen(false);
  };

  return (
    <>
      <Input
        label="Api URL"
        value={url}
        onFocus={handleFocus}
        onChange={(e) => setUrl(e.target.value)}
      />
      <ActionButton onClick={() => handleSetApi(url)}>Update URL</ActionButton>
    </>
  );
};
