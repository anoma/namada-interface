# types

This package is to provide types shared between applications in the Anoma ecosystem, primarily that of
the `namada-interface` and `extension` apps.

Some types from `@keplr-wallet/types` have been aliased and re-exported, as we may want to support a
more custom configuration for chain and currency configurations. These have been added to reduce the
work necessary to refactor against a custom type definition.

The exported `Anoma` and `WindowWithAnoma` types serve as a public interface allowing other applications to
integrate with the APIs provided by the extension using TypeScript.
