import { SdkEvents } from "@heliaxdev/namada-sdk/web";
import { Toasts } from "App/Common/Toast";
import { AppLayout } from "App/Layout/AppLayout";
import { createBrowserHistory } from "history";
import { useExtensionEvents } from "hooks/useExtensionEvents";
import { useRegistryFeatures } from "hooks/useRegistryFeatures";
import { useTransactionCallback } from "hooks/useTransactionCallbacks";
import { useTransactionNotifications } from "hooks/useTransactionNotifications";
import { useTransactionWatcher } from "hooks/useTransactionWatcher";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { ChainLoader } from "./Setup/ChainLoader";

export const history = createBrowserHistory({ window });

export function App(): JSX.Element {
  useExtensionEvents();
  useTransactionNotifications();
  useTransactionCallback();
  useRegistryFeatures();
  useTransactionWatcher();

  // TODO: This useEffect should be removed! Just testing here:
  useEffect(() => {
    // eslint-disable-next-line
    const onProgressBarStarted = (e: any): void => {
      console.info(SdkEvents.ProgressBarStarted, e);
    };

    // eslint-disable-next-line
    const onProgressBarIncremented = (e: any): void => {
      console.info(SdkEvents.ProgressBarIncremented, e);
    };

    // eslint-disable-next-line
    const onProgressBarFinished = (e: any): void => {
      console.info(SdkEvents.ProgressBarFinished, e);
    };

    document.onreadystatechange = function () {
      window.addEventListener(
        SdkEvents.ProgressBarStarted,
        onProgressBarStarted
      );

      window.addEventListener(
        SdkEvents.ProgressBarIncremented,
        onProgressBarIncremented
      );
      window.addEventListener(
        SdkEvents.ProgressBarFinished,
        onProgressBarFinished
      );

      return () => {
        window.removeEventListener(
          SdkEvents.ProgressBarStarted,
          onProgressBarStarted
        );
        window.removeEventListener(
          SdkEvents.ProgressBarIncremented,
          onProgressBarIncremented
        );
        window.removeEventListener(
          SdkEvents.ProgressBarFinished,
          onProgressBarFinished
        );
      };
    };
  }, []);

  return (
    <>
      <Toasts />
      <AppLayout>
        <ChainLoader>
          <Outlet />
        </ChainLoader>
      </AppLayout>
    </>
  );
}
