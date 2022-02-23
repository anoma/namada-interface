# Anoma Extension

The Anoma extension is a web-extension to manage and make operations with your Anoma keypairs.

## Structure of the Web Extension

A webextension are composed of [many types of files](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Anatomy_of_a_WebExtension).

Currently, we have a `background script`, a `contentScrips file`, an `options` page and a `popup`.

The files for each part are found in the `src/` folder.

### Background scripts

Background scrips are responsible for long-running logic (like persistent storage).
In our application, it's responsible for handling selected key state, handling messages from web applications and handling extension state.
While messages are handled on `BackgroundMain`, the state is created and encapsulated in `BackgroundState`, and is only mutated by message-passing to that module.

### Popup

The popup is used for displaying simple interfaces for the user.
As soon as the popup is closed, its state is lost, so more complex interactions
should be done in a [extension page](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Anatomy_of_a_WebExtension#extension_pages).

### Content scripts

Content scripts are responsible for running code on every page the user access. Their main use is for enabling the connection between Background and Web pages, through the use of `Bridge.allowWindowMessaging`. For this, we use a fork of [webext-bridge](https://github.com/heliaxdev/webext-bridge).
