import { TransferCompletedEvent } from "content/events";
import { ExtensionRequester } from "extension";
import { Ports } from "router";

export class ContentService {
  constructor(private readonly requester: ExtensionRequester) {}

  async handleTransferCompleted(
    success: boolean,
    msgId: string
  ): Promise<void> {
    // TODO: most likely we want to send this back to the sender.
    // We can get sender's tabId from the onMessage listener.
    return this.requester.sendMessageToCurrentTab(
      Ports.WebBrowser,
      new TransferCompletedEvent(success, msgId)
    );
  }
}
