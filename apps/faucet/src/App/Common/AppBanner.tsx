import { AppContext } from "App/App";
import React, { useContext } from "react";
import { Banner, BannerContents } from "./Banner.components";

export const AppBanner: React.FC = () => {
  const { isTestnetLive, settings } = useContext(AppContext)!;
  return (
    <>
      {!isTestnetLive && settings?.startsAtText && (
        <Banner>
          <BannerContents>
            Testnet will go live {settings.startsAtText}! Faucet is disabled
            until then.
          </BannerContents>
        </Banner>
      )}
    </>
  );
};
