# Browser Extension

The browser extension consists of the following top-level components that make up the entirety of the extension:

- Background scripts (service worker for Chrome, and background pages for Firefox)
- Content scripts
- Main application (`apps/extension/src/App`) accessibly from the popup
- Setup application for initializing wallet (`apps/extension/src/Setup`), launched in a new tab when setting up for the first time

## Technical Details

The stack for the extension apps consists of the following:

- TypeScript
- React
- Styled-Components
- `webpack` and `webpack-dev-server`
- `webextension-polyfill` to support all browsers

More information on the various aspects of the extension can be found at the following:

- [Architecture](./architecture.md)
- [Integration with web applications](./integration.md)
- [Interfaces](./interface.md)
- [Key Management](./key-management.md)
- [Security](./security.md)
- [Session management](./session.md)
- [Storage](./storage.md)
