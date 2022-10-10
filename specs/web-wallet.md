<h1>Web Wallet UI and Features</h1>

- [LockScreen](#lockscreen)
  - [LockScreen](#lockscreen-1)
- [AccountOverview](#accountoverview)
  - [AccountOverview](#accountoverview-1)
  - [AccountOverview/TokenDetails](#accountoverviewtokendetails)
  - [AccountOverview/TokenDetails/Receive](#accountoverviewtokendetailsreceive)
  - [AccountOverview/TokenDetails/Send](#accountoverviewtokendetailssend)
- [StakingGovernancePgf](#stakinggovernancepgf)
  - [Staking/Overview](#stakingoverview)
  - [Staking/ValidatorDetails](#stakingvalidatordetails)
  - [Governance/Proposals](#governanceproposals)
  - [Governance/ProposalDetails](#governanceproposaldetails)
  - [Governance/AddProposal](#governanceaddproposal)
  - [PublicGoodsFunding/Overview](#publicgoodsfundingoverview)
  - [PublicGoodsFunding/Council](#publicgoodsfundingcouncil)
  - [PublicGoodsFunding/ContinuousFunding](#publicgoodsfundingcontinuousfunding)
  - [PublicGoodsFunding/RetrospectiveFunding](#publicgoodsfundingretrospectivefunding)
- [Settings](#settings)
  - [Settings](#settings-1)
  - [Settings/WalletSettings](#settingswalletsettings)
  - [Settings/Accounts](#settingsaccounts)
  - [Settings/Accounts/NewAccount](#settingsaccountsnewaccount)
  - [Settings/AccountSettings](#settingsaccountsettings)

The application is divided to 4 main sections:
* LockScreen
* AccountOverview
* StakingAndGovernance
* Settings

These are further divided to individual screens or flows (comprising several screens) grouping activities that belong together. For example, under **StakingAndGovernance** we have:

* **StakingAndGovernance/Staking** - which gives the user the possibility to see all the validators and navigate to a screen where the actual staking is performed.

Each screen listed below is associated with a high level wireframe design to give a visual presentation of the user interface. Each view is named and being referred with that name through out all communication and in the codebase.

<img style="max-width: 600px" src="stakingAndGovernance.png" />

*This screen represents StakingAndGovernance/Staking view*


## LockScreen
When the user accesses the wallet for the first time there is a need to create a new account. This screen gives the user to possibility to do so or unlock the wallet by using an existing account.

### LockScreen
[Wireframe](https://www.figma.com/file/aiWZpaXjPLW6fDjE7dpFaU/Projects-2021?node-id=6442%3A5801)
User can:
* can to unlock the wallet by entering the master password
* can to start a flow to create a new account

## AccountOverview
This is the most important part of the application and the part where the user spends the most time. Here the user performs the most common tasks such as creating transactions. Only one account is selected as a time and the selected account is indicated here.

### AccountOverview
[Wireframe](https://www.figma.com/file/aiWZpaXjPLW6fDjE7dpFaU/Projects-2021?node-id=6442%3A5492)
User can:
* see the aggregated balance in fiat currency
* can see the currently selected account address
* can navigate to **Settings/Accounts** for changing the account
* can see a listing of all hold tokens and their logos, balances, names


### AccountOverview/TokenDetails
[Wireframe](https://www.figma.com/file/aiWZpaXjPLW6fDjE7dpFaU/Projects-2021?node-id=6442%3A5681)
User can:
* can see the balance of token in native and fiat currency
* can navigate to **AccountOverview/TokenDetails/Receive** for receiving tokens
* can navigate to **AccountOverview/TokenDetails/Send** for sending tokens
* can see a listing of past transaction of the current account and selected token

### AccountOverview/TokenDetails/Receive
[Wireframe](https://www.figma.com/file/aiWZpaXjPLW6fDjE7dpFaU/Projects-2021?node-id=6472%3A6476)
User can:
* see QR code of the address
* see address as a string and copy it by clicking button

### AccountOverview/TokenDetails/Send
[Wireframe 1](https://www.figma.com/file/aiWZpaXjPLW6fDjE7dpFaU/Projects-2021?node-id=6472%3A9579)
[Wireframe 2](https://www.figma.com/file/aiWZpaXjPLW6fDjE7dpFaU/Projects-2021?node-id=6472%3A9715)
[Wireframe 3](https://www.figma.com/file/aiWZpaXjPLW6fDjE7dpFaU/Projects-2021?node-id=6472%3A9797)
User can:
view 1:
* see the balance of the token in current account
* enter details: transfer amount, recipient address, memo
* can select to perform the transaction as shielded

view 2:
* see a summary of the transaction details
* clear indication whether the transaction is transparent of shielded
* select a gas fee
* see an option in gas fees that is specific for shielded transactions
* see a transaction summary including gas fee

view 3:
* see a confirmation once the transaction is confirmed
* be abel to navigate to see the new transaction in the block explorer
* be able to navigate back to **AccountOverview/TokenDetails**



## StakingGovernancePgf
Aside of **AccountOverview** this is a part that the user is likely visiting frequently. When user clicks the main menu **Staking & Governance** a sub menu with 3 options (Staking, Governance, Public Goods Funding) opens. Staking is selected as a default.

### Staking/Overview

[designs](https://www.figma.com/file/aiWZpaXjPLW6fDjE7dpFaU/Projects-2021?node-id=9259%3A15554)

User can:

* see an overview of own balances (staked, available, ...)
* see own active staking positions
* see listing and be able to search all validators
* easily be able to filter validators by state (active, inactive, ...)

### Staking/ValidatorDetails

[designs](https://www.figma.com/file/aiWZpaXjPLW6fDjE7dpFaU/Projects-2021?node-id=9286%3A11884)

User can:
* see all information in chain about the validator
* see a logo of the validator
* see a and click link to validators website
* see all staking positions with the current validator
* see all unclaimed rewards with the current validator
* open a modal to manage new staking, unstake, and claim rewards

### Governance/Proposals

[designs](https://www.figma.com/file/aiWZpaXjPLW6fDjE7dpFaU/Projects-2021?node-id=9296%3A13063)
User can:
* see a listing of the latest proposals and their statuses
* filter by proposal status
* search by proposal title
* navigate to the details of any proposal
* navigate to a view to create new proposal

### Governance/ProposalDetails

[designs](https://www.figma.com/file/aiWZpaXjPLW6fDjE7dpFaU/Projects-2021?node-id=9296%3A13745)
User can:
* see all the details of the proposal
* can vote on proposal if vote is open and the user has not voted yet
* can see all voting details of the proposal
* can see full description

### Governance/AddProposal

[designs](https://www.figma.com/file/aiWZpaXjPLW6fDjE7dpFaU/Projects-2021?node-id=9296%3A14019)
User can:
* enter the details (TBD) of the proposal
* see a summary of the proposal
* submit the proposal
* be prompted for a payment by the wallet

### PublicGoodsFunding/Overview

[designs](https://www.figma.com/file/aiWZpaXjPLW6fDjE7dpFaU/Projects-2021?node-id=9254%3A14841)
User can:
* see a list of current council members
* see a list of the latest continuous funding
* see a list of the latest retrospective funding
* [navigate](###PublicGoodsFunding/Council) to see current and past council members
* [navigate](###PublicGoodsFunding/ContinuousFunding) to see all continuous funding
* [navigate](###PublicGoodsFunding/RetrospectiveFunding) to see all retrospective funding


### PublicGoodsFunding/Council

[designs](https://www.figma.com/file/aiWZpaXjPLW6fDjE7dpFaU/Projects-2021?node-id=9254%3A14099)
User can:
* see the details of the councils, including their funding, budget, members, ...
* As a default see the current council is being displayed
* select a tab "Past" and see all the past councils
* Select any of the past council in the table and see it's details
* navigate to [governance vote](#Governance/ProposalDetails) for the council
* navigate to see the details of [continuous](#PublicGoodsFunding/RetrospectiveFunding) and [retrospective](#PublicGoodsFunding/ContinuousFunding) funding of the funding of the council
* navigate to [the council member view](#PublicGoodsFunding/CouncilMemberDetails) to see details about the council members

### PublicGoodsFunding/ContinuousFunding

[designs](https://www.figma.com/file/aiWZpaXjPLW6fDjE7dpFaU/Projects-2021?node-id=9254%3A13845)
User can:
* See all the funding
* filter by: all, active, past
* navigate to the council details that approved this funding
* navigate to block explorer to see the transaction for the payments

### PublicGoodsFunding/RetrospectiveFunding

[designs](https://www.figma.com/file/aiWZpaXjPLW6fDjE7dpFaU/Projects-2021?node-id=9254%3A13845)
User can:
* See all the funding
* filter by: all, upcoming
* navigate to the council details that approved this funding
* navigate to block explorer to see the transaction for the payments

## Settings
This is a part of the application that is visited less often. This is where the user can change settings of select the active account.

### Settings
[Wireframe](https://www.figma.com/file/aiWZpaXjPLW6fDjE7dpFaU/Projects-2021?node-id=6496%3A13327)
User can:
* Navigate to **Settings/Accounts**
* Navigate to **Settings/WalletSettings**

### Settings/WalletSettings
[Wireframe](https://www.figma.com/file/aiWZpaXjPLW6fDjE7dpFaU/Projects-2021?node-id=6496%3A6235)
User can:
* see and change the fiat currency to display in various locations in the app where amounts are being displayed in fiat currency
* Default fiat currency is USD

### Settings/Accounts
[Wireframe](https://www.figma.com/file/aiWZpaXjPLW6fDjE7dpFaU/Projects-2021?node-id=6472%3A9901)
User can:
* select an account by clicking it, when it becomes visibly selected
* can navigate to **Settings/AccountSettings** for changing the settings of certain account
* can navigate to Settings/Accounts/NewAccount/Start for adding a new account to the wallet


### Settings/Accounts/NewAccount
[Wireframe 1](https://www.figma.com/file/aiWZpaXjPLW6fDjE7dpFaU/Projects-2021?node-id=6442%3A5866)
[Wireframe 2](https://www.figma.com/file/aiWZpaXjPLW6fDjE7dpFaU/Projects-2021?node-id=6442%3A5956)
[Wireframe 3](https://www.figma.com/file/aiWZpaXjPLW6fDjE7dpFaU/Projects-2021?node-id=6442%3A6015)
[Wireframe 4](https://www.figma.com/file/aiWZpaXjPLW6fDjE7dpFaU/Projects-2021?node-id=6442%3A6104)
[Wireframe 5](https://www.figma.com/file/aiWZpaXjPLW6fDjE7dpFaU/Projects-2021?node-id=6442%3A6190)
User can:

view 1:
* see a welcome screen that explain the flow

view 2:
* enter an alias to the account
* enter and confirm a password
* select the length of the seed phrase (12 or 24 words)

view 3:
* see a seed phrase that was generated
* copy the seed phrase to clipboard

view 4:
* enter a randomly requested word from the set of words. ("please enter word #5")

view 5:
* see a confirmation that the account was created
* navigate to **AccountOverview** and so that the newly created account becomes the selected account

### Settings/AccountSettings
[Wireframe](https://www.figma.com/file/aiWZpaXjPLW6fDjE7dpFaU/Projects-2021?node-id=6472%3A10076)
User can:
* Rename the selected account
* display the seed phrase, user is being prompted for a password
* delete account, user is prompted to input a security text to prevent an accidental deletion
* select the network