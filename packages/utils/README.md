# packages/utils

This package contains reusable utilities, as well as the theme utility shared by `namada-interface` and `extension`.

- [Theme](#theme)
  - [Colors](#colors)
  - [Example](#example)
  - [Exceptions](#exceptions)

## theme

The styles are initially defined in Figma [here](https://www.figma.com/file/NFyHbLZXBSl3aUsMxtffvV/Namada-Wallet?node-id=3%3A12). The style consist of:

- colors
- spaces
- border radius
- type information
  - font family
  - sizes
  - weights
  - colors

All this information is typed in the app under `apps/namada-interface/src/utils/theme/theme.ts`. The 2 most important types are `PrimitiveColors` which defines the colors. And `DesignConfiguration` which collects all design tokens together.
Now some of the styles are different between light and dark modes. We alrways define 2 `PrimitiveColors`, one for light and one for dark. The getter function returns the correct based on which mode the user has selected.

##### Colors

Under colors we have 6 main color groups:

- `primary` - main brand specific
- `secondary` - secondary brand specific
- `tertiary` - tertiary brand specific
- `utility1` - mostly backgrounds and panels
- `utility2` - mostly foregrounds and texts
- `utility3` - generic utils such as warning, error, etc.

https://www.figma.com/file/aiWZpaXjPLW6fDjE7dpFaU/Projects-2021?node-id=9102%3A8806

##### Example

Then in styled components we can do:

```ts
export const AccountCreationContainer = styled.div`
  background-color: ${(props) => props.theme.colors.primary.main80};
`;
```

##### Exceptions

Sometimes we cannot use same color (such as `colors.primary.main80`) for both the dark and light modes, such as the logo. In these cases we define a getter in styles component (or React) files to facilitate this difference.

```ts
// Button.components.ts
import { DesignConfiguration } from "utils/theme";

enum ComponentColor {
  ButtonBackground,
  ContainedButtonLabelColor,
}

const getColor = (
  color: ComponentColor,
  theme: DesignConfiguration
): string => {
  const isDark = theme.themeConfigurations.isLightMode;
  switch (color) {
    case ComponentColor.ButtonBackground:
      return isDark ? theme.colors.primary.main : theme.colors.secondary.main;
    case ComponentColor.ContainedButtonLabelColor:
      return isDark ? theme.colors.utility3.black : theme.colors.utility3.black;
  }
};

// then we use it like this
export const ContainedButton = styled.div`
  color: ${(props) => props.theme.colors.primary.main};
  background-color: ${(props) =>
    getColor(ComponentColor.ButtonBackground, props.theme)};
`;
```
