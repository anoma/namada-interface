# Browser Extension - Interface

The stack for the extension interface contains the following:

- TypeScript
- React
- `react-router-dom`
- Styled-Components

Unlike Namada Interface, the extension is not currently using `@redux/toolkit`. If the requirements are extended in the future,
it may make good sense to incorporate it.

Like Namada Interface, the extension uses a custom `webpack` configuration, which is best suited to the needs of the extension. It is important that Webpack is configured
correctly to allow `wasm` to execute correctly in the extension when installed in Chrome.
