# The state management of namada-interface

## Description
This directory contains the state management for the application. It is divided by main topics (staking and governance, transfers, ...). Each directory contains the following files:
* **actions.ts** - this contains all the actions for the state. All the side effects (network calls, calls to libs, ...) are being performed from here.
* **reducers.ts** - all reducers of the state are here. This is where the state changes are being committed. Commonly all actions have 3 reducers associated with them:
    * **pending** - this is being triggered with the initial dispatch call (mostly originating from the UI or view Components). The payload to this is same as the action was dispatched with.
    * **fulfilled** - This is being fired when the action resolves successfully
    * **rejected** - This is being fired when the action resolves unsuccessfully
* **types.ts** - this contains all the types that relates to the actual persisted data and the state. It could also contains utils and constants that are needed. The View components can import relevant types from here. And this makes it feel that this whole directory should live next to it's main consumer.
* **__test__** - this contains the unit tests for the actions and the reducers.
* **fakeData.ts** - if there are in-development features we might need so mock data.
* **index.ts** - defines the visible API of the module
## State
* **StakingAndGovernance** - this contains all data that is mainly used under the Staking & Governance menu. It contains all the features for staking, governance and public goods funding.
* **AccountsNew** - This contains the state for Accounts. It has the prefix "New" as there is a transition that should be finished to move all accounts related state management to this folder. Now it lives partly in `accounts.ts` file. (TODO: https://github.com/anoma/namada-interface/issues/4#issuecomment-1259116869)

