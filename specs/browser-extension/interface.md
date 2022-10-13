# Browser Extension - Interface

The interface for the browser extension should follow a similar stack to what we presently utilize in `namada-interface`. This will make it possible
to reuse similar components and development processes as we currently employ.

The stack should resemble the following:

- TypeScript
- React
- Redux-Toolkit (`@reduxjs/toolkit`)
- Styled-Components

While this stack is generally consistent, we should perhaps move away from `create-react-app`, as this imits the control we
have on the build pipeline (making it more difficult to customize). We should consider using Parcel and
[@parcel/config-web-extension](https://parceljs.org/recipes/web-extension/) as an improvement in development process,
or a custom build pipline with Webpack, versus using `create-react-app`.
