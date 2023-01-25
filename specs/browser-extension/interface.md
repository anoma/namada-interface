# Browser Extension - Interface

The stack for the extension interface contains the following:

- TypeScript
- React
- `react-router-dom`
- Styled-Components

Unlike `namada-interface`, the extension is not currently using `@redux/toolkit`. If the requirements are extended in the future,
it may make good sense to incorporate it.

While this stack is generally consistent with `namada-interface`, it has moved away from using `create-react-app` and `react-scripts`. The extension
uses a custom `webpack` configuration, which is much better suited to the needs of the extension. It is important that Webpack is configured
correctly to allow `wasm` to execute correctly in the extension when installed in Chrome.
