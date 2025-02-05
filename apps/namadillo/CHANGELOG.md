# Changelog

## [1.6.0](https://github.com/anoma/namada-interface/compare/namadillo@v1.5.0...namadillo@v1.6.0) (2025-02-05)


### Features

* Add shielded balance pulse animation ([#1604](https://github.com/anoma/namada-interface/issues/1604)) ([7fb9b0a](https://github.com/anoma/namada-interface/commit/7fb9b0acd363163483926c4ec4e0ff832edac322))
* Check for ibc timeout if a response was not provided by the chain ([#1592](https://github.com/anoma/namada-interface/issues/1592)) ([9850a1c](https://github.com/anoma/namada-interface/commit/9850a1c16baacac06f89d060a2d8deeeb9af9231))
* Improving masp transactions feedback for users and other gas estimation fixes ([#1594](https://github.com/anoma/namada-interface/issues/1594)) ([426dbd3](https://github.com/anoma/namada-interface/commit/426dbd364bafcfc8788fd76054104af8fb685f22))
* Shielded rewards intergration ([#1378](https://github.com/anoma/namada-interface/issues/1378)) ([622044d](https://github.com/anoma/namada-interface/commit/622044de6a20cb673803eadf1330ccb18b9ae903))
* Update shield sync indicator layout ([#1601](https://github.com/anoma/namada-interface/issues/1601)) ([9baea53](https://github.com/anoma/namada-interface/commit/9baea5329cbdad757e189a6a5dc4bb28246592e0))


### Bug Fixes

* Disposable gas payer timeout & ibc shielding with multicore ([#1593](https://github.com/anoma/namada-interface/issues/1593)) ([a1cb27a](https://github.com/anoma/namada-interface/commit/a1cb27a26c0bbad3e558c4bcec37305cf0602083))
* Empty reward storage ([#1600](https://github.com/anoma/namada-interface/issues/1600)) ([f9074e9](https://github.com/anoma/namada-interface/commit/f9074e92d2411ca2f073395a03bdd37516b18b27))
* Fix duplicated broadcast ([#1606](https://github.com/anoma/namada-interface/issues/1606)) ([897596c](https://github.com/anoma/namada-interface/commit/897596c1d05aaf8e7fba5c730a778b95fb7d0128))
* Fixing gas estimate on IBC transfers ([#1607](https://github.com/anoma/namada-interface/issues/1607)) ([be1e7d7](https://github.com/anoma/namada-interface/commit/be1e7d7665d43ca81cc4eeefb62cf9fdc35552de))
* Fixing remaining amount calculation if gas token is different ([#1610](https://github.com/anoma/namada-interface/issues/1610)) ([de6cfe3](https://github.com/anoma/namada-interface/commit/de6cfe39b3eb25bda8a02da4a732de35ad590106))

## [1.5.0](https://github.com/anoma/namada-interface/compare/namadillo@v1.4.1...namadillo@v1.5.0) (2025-01-27)


### Features

* Add gas selector ([#1585](https://github.com/anoma/namada-interface/issues/1585)) ([8cacded](https://github.com/anoma/namada-interface/commit/8cacded71493cad31d91efb6773ab471350035e4))
* Add the possibility of overriding button error texts ([#1584](https://github.com/anoma/namada-interface/issues/1584)) ([58bb84d](https://github.com/anoma/namada-interface/commit/58bb84de75e2e159e633e369ace87b48303fdaf5))
* Fixing ibc transfers gas estimate ([#1567](https://github.com/anoma/namada-interface/issues/1567)) ([c231522](https://github.com/anoma/namada-interface/commit/c231522290019c657b50a1d4d0ae2a1100af624e))
* Improvements on IBC withdrawal ([#1574](https://github.com/anoma/namada-interface/issues/1574)) ([ba94c23](https://github.com/anoma/namada-interface/commit/ba94c23aef5946e8e5110b5b46926dbc218244f1))
* Improving masp loading states ([#1583](https://github.com/anoma/namada-interface/issues/1583)) ([9879db0](https://github.com/anoma/namada-interface/commit/9879db0c5fcfa304d4e5421bcf2f312634a33d17))

## [1.4.1](https://github.com/anoma/namada-interface/compare/namadillo@v1.4.0...namadillo@v1.4.1) (2025-01-16)


### Bug Fixes

* Removing newly introduced config variables ([#1565](https://github.com/anoma/namada-interface/issues/1565)) ([cc5129c](https://github.com/anoma/namada-interface/commit/cc5129c6c789d6fff88e261092e54f220f024d76))

## [1.4.0](https://github.com/anoma/namada-interface/compare/namadillo@v1.3.0...namadillo@v1.4.0) (2025-01-15)


### Features

* Add version warning banner (anoma[#1491](https://github.com/anoma/namada-interface/issues/1491)) ([#1534](https://github.com/anoma/namada-interface/issues/1534)) ([02cd5eb](https://github.com/anoma/namada-interface/commit/02cd5eb3413c64d18b62b93f94d1ba7c7187bddb))
* Fetch shielded balances on transfer ([#1547](https://github.com/anoma/namada-interface/issues/1547)) ([61107fc](https://github.com/anoma/namada-interface/commit/61107fc46942021b657d675a3a4ee82b8c7124fb))
* Fetching known ibc channels from github chain-registry repository ([#1545](https://github.com/anoma/namada-interface/issues/1545)) ([1e528c8](https://github.com/anoma/namada-interface/commit/1e528c815efb18659304e52f4f5dad228005f1bf))


### Bug Fixes

* Fix fee component on transfers ([#1548](https://github.com/anoma/namada-interface/issues/1548)) ([83228bf](https://github.com/anoma/namada-interface/commit/83228bfbcea6f4a35873791b5bc728116efe0f14))

## [1.3.0](https://github.com/anoma/namada-interface/compare/namadillo@v1.2.0...namadillo@v1.3.0) (2025-01-14)


### Features

* Listen for the transfer success event ([#1490](https://github.com/anoma/namada-interface/issues/1490)) ([41b7158](https://github.com/anoma/namada-interface/commit/41b7158e2e2c804234935e42bc9a07df1fb1c000))

## [1.2.0](https://github.com/anoma/namada-interface/compare/namadillo-v1.1.13...namadillo@v1.2.0) (2025-01-14)

- First release using release-please
