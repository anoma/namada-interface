

## 0.14.0 (2025-01-06)


### Features

* add support for IBC deposits to shielded ([#1163](https://github.com/anoma/namada-interface/issues/1163)) ([50d8e61](https://github.com/anoma/namada-interface/commit/50d8e61374c39c9a89afab183ee87f87d4c0a561))
* allow Sdk to update itself, regen docs ([#861](https://github.com/anoma/namada-interface/issues/861)) ([ce1562b](https://github.com/anoma/namada-interface/commit/ce1562bf9ca61fe8a7372a74963ea616bc0ce129))
* bump to 0.13.0 ([#1380](https://github.com/anoma/namada-interface/issues/1380)) ([2d78352](https://github.com/anoma/namada-interface/commit/2d78352d0f5608f7909c79b4a523e8851faa9739))
* bump to 0.39.0, specify transparent transfer in types ([#858](https://github.com/anoma/namada-interface/issues/858)) ([3ad6200](https://github.com/anoma/namada-interface/commit/3ad620045a6c2c51dda7be0ccc1a2e88b54a959e))
* enable IBC withdrawals for all tokens ([#1243](https://github.com/anoma/namada-interface/issues/1243)) ([14106eb](https://github.com/anoma/namada-interface/commit/14106eba676c38cc3fee379221359557c5758da2)), closes [#1242](https://github.com/anoma/namada-interface/issues/1242) [#1222](https://github.com/anoma/namada-interface/issues/1222)
* fetch and load masp params ([#1136](https://github.com/anoma/namada-interface/issues/1136)) ([5df8577](https://github.com/anoma/namada-interface/commit/5df8577cf0627247a7aeb5fa4de5e3970049b024))
* hook up interface to SDK package, extension signing ([1e2ad8e](https://github.com/anoma/namada-interface/commit/1e2ad8e4ff3c64451e94d36ef9559180fbcd27c5))
* hook up tx hash to build Tx, add to SDK ([#753](https://github.com/anoma/namada-interface/issues/753)) ([35909e7](https://github.com/anoma/namada-interface/commit/35909e7a2cdba35fea0f0af46b8628de240d420e))
* **interface:** fixing namadillo dev serve ([c66af51](https://github.com/anoma/namada-interface/commit/c66af51f59c6b4d611e0c69911e73e6605678191))
* move sdk package into [@namada](https://github.com/namada) org ([#1230](https://github.com/anoma/namada-interface/issues/1230)) ([0376020](https://github.com/anoma/namada-interface/commit/0376020411a6b123376a39bce4240bb7468858ae))
* post-release bumps, changelogs ([#1364](https://github.com/anoma/namada-interface/issues/1364)) ([a2f3f5c](https://github.com/anoma/namada-interface/commit/a2f3f5cd54ff4bf905b385dc58a9c5d44c2c4ba4))
* sdk api improvements ([#695](https://github.com/anoma/namada-interface/issues/695)) ([6eee06c](https://github.com/anoma/namada-interface/commit/6eee06cb2b40eac8bd2eebc399fc87698654aaa1))
* sdk js publish ([#665](https://github.com/anoma/namada-interface/issues/665)) ([ec3dec8](https://github.com/anoma/namada-interface/commit/ec3dec8070219f29ccf95e8a50c880da3f032566))
* sdk version bump, changelog ([#1175](https://github.com/anoma/namada-interface/issues/1175)) ([f70a6a4](https://github.com/anoma/namada-interface/commit/f70a6a4c1e1d8ddef3e2985ec16295c666f4c95b))
* shield nam ([#1165](https://github.com/anoma/namada-interface/issues/1165)) ([e6b5530](https://github.com/anoma/namada-interface/commit/e6b55307c77312a3bdde192ec721d5e84883d4ba))
* shielded sync improvements ([#1441](https://github.com/anoma/namada-interface/issues/1441)) ([7a5430a](https://github.com/anoma/namada-interface/commit/7a5430acf4a129fcaef0025aedd117015437d425))
* support claim rewards tx in SDK ([#932](https://github.com/anoma/namada-interface/issues/932)) ([59d0ea9](https://github.com/anoma/namada-interface/commit/59d0ea9659658c23c804324d46594783ed695a2e)), closes [#679](https://github.com/anoma/namada-interface/issues/679)
* support decoding ibc tx details in sdk ([#1174](https://github.com/anoma/namada-interface/issues/1174)) ([1bd083b](https://github.com/anoma/namada-interface/commit/1bd083ba5883a3f722a6838b9694223afeae71a1))
* unshield + shielded transfers + disposable gas payer ([#1191](https://github.com/anoma/namada-interface/issues/1191)) ([e8f0b39](https://github.com/anoma/namada-interface/commit/e8f0b39452f0b7fac583ee7cb5812409378cfcd0))
* update docs in SDK & types ([#1472](https://github.com/anoma/namada-interface/issues/1472)) ([dbcef4f](https://github.com/anoma/namada-interface/commit/dbcef4fa19f0373ae7a328e5c30e1e4dab2b599d))
* update unbonding period calculation ([#1034](https://github.com/anoma/namada-interface/issues/1034)) ([2e65ae8](https://github.com/anoma/namada-interface/commit/2e65ae8ae3d2430b6268603785c30016d2df77a6))
* update zip32 path ([#621](https://github.com/anoma/namada-interface/issues/621)) ([c4e5413](https://github.com/anoma/namada-interface/commit/c4e54131064b1d7df3704a0f815cd041dc551740))
* vks birthdays ([#1415](https://github.com/anoma/namada-interface/issues/1415)) ([294031d](https://github.com/anoma/namada-interface/commit/294031d8c7bf53c56fc81404b46d6c63ce13b651))


### Bug Fixes

* fix tests ([d49bd66](https://github.com/anoma/namada-interface/commit/d49bd66a00556205374fe19a092a36717d7ba75a))
* linting and TypeScript errors ([82eb87e](https://github.com/anoma/namada-interface/commit/82eb87eeb8f96100f239c7ff1a6cc2e953fbfdac))
* move optional value to end of schema, no empty memo ([#1379](https://github.com/anoma/namada-interface/issues/1379)) ([ee49600](https://github.com/anoma/namada-interface/commit/ee496001aad9291e3bb224f91ac5caf31a1143db))
* SDK and extension should use the same ledger-namada package ([#1376](https://github.com/anoma/namada-interface/issues/1376)) ([7fa916b](https://github.com/anoma/namada-interface/commit/7fa916b049b2dacc9b9dca7ee062319f8c2bee5a))
* updating imports for consistency ([#1325](https://github.com/anoma/namada-interface/issues/1325)) ([ae2b4eb](https://github.com/anoma/namada-interface/commit/ae2b4eb0d5aa8f464cd8752404742359702210d4))

## 0.13.0 (2024-12-04)


### Features

* add support for IBC deposits to shielded ([#1163](https://github.com/anoma/namada-interface/issues/1163)) ([50d8e61](https://github.com/anoma/namada-interface/commit/50d8e61374c39c9a89afab183ee87f87d4c0a561))
* allow Sdk to update itself, regen docs ([#861](https://github.com/anoma/namada-interface/issues/861)) ([ce1562b](https://github.com/anoma/namada-interface/commit/ce1562bf9ca61fe8a7372a74963ea616bc0ce129))
* bump to 0.39.0, specify transparent transfer in types ([#858](https://github.com/anoma/namada-interface/issues/858)) ([3ad6200](https://github.com/anoma/namada-interface/commit/3ad620045a6c2c51dda7be0ccc1a2e88b54a959e))
* enable IBC withdrawals for all tokens ([#1243](https://github.com/anoma/namada-interface/issues/1243)) ([14106eb](https://github.com/anoma/namada-interface/commit/14106eba676c38cc3fee379221359557c5758da2)), closes [#1242](https://github.com/anoma/namada-interface/issues/1242) [#1222](https://github.com/anoma/namada-interface/issues/1222)
* fetch and load masp params ([#1136](https://github.com/anoma/namada-interface/issues/1136)) ([5df8577](https://github.com/anoma/namada-interface/commit/5df8577cf0627247a7aeb5fa4de5e3970049b024))
* hook up interface to SDK package, extension signing ([1e2ad8e](https://github.com/anoma/namada-interface/commit/1e2ad8e4ff3c64451e94d36ef9559180fbcd27c5))
* hook up tx hash to build Tx, add to SDK ([#753](https://github.com/anoma/namada-interface/issues/753)) ([35909e7](https://github.com/anoma/namada-interface/commit/35909e7a2cdba35fea0f0af46b8628de240d420e))
* **interface:** fixing namadillo dev serve ([c66af51](https://github.com/anoma/namada-interface/commit/c66af51f59c6b4d611e0c69911e73e6605678191))
* move sdk package into [@namada](https://github.com/namada) org ([#1230](https://github.com/anoma/namada-interface/issues/1230)) ([0376020](https://github.com/anoma/namada-interface/commit/0376020411a6b123376a39bce4240bb7468858ae))
* post-release bumps, changelogs ([#1364](https://github.com/anoma/namada-interface/issues/1364)) ([a2f3f5c](https://github.com/anoma/namada-interface/commit/a2f3f5cd54ff4bf905b385dc58a9c5d44c2c4ba4))
* sdk api improvements ([#695](https://github.com/anoma/namada-interface/issues/695)) ([6eee06c](https://github.com/anoma/namada-interface/commit/6eee06cb2b40eac8bd2eebc399fc87698654aaa1))
* sdk js publish ([#665](https://github.com/anoma/namada-interface/issues/665)) ([ec3dec8](https://github.com/anoma/namada-interface/commit/ec3dec8070219f29ccf95e8a50c880da3f032566))
* sdk version bump, changelog ([#1175](https://github.com/anoma/namada-interface/issues/1175)) ([f70a6a4](https://github.com/anoma/namada-interface/commit/f70a6a4c1e1d8ddef3e2985ec16295c666f4c95b))
* shield nam ([#1165](https://github.com/anoma/namada-interface/issues/1165)) ([e6b5530](https://github.com/anoma/namada-interface/commit/e6b55307c77312a3bdde192ec721d5e84883d4ba))
* support claim rewards tx in SDK ([#932](https://github.com/anoma/namada-interface/issues/932)) ([59d0ea9](https://github.com/anoma/namada-interface/commit/59d0ea9659658c23c804324d46594783ed695a2e)), closes [#679](https://github.com/anoma/namada-interface/issues/679)
* support decoding ibc tx details in sdk ([#1174](https://github.com/anoma/namada-interface/issues/1174)) ([1bd083b](https://github.com/anoma/namada-interface/commit/1bd083ba5883a3f722a6838b9694223afeae71a1))
* update unbonding period calculation ([#1034](https://github.com/anoma/namada-interface/issues/1034)) ([2e65ae8](https://github.com/anoma/namada-interface/commit/2e65ae8ae3d2430b6268603785c30016d2df77a6))
* update zip32 path ([#621](https://github.com/anoma/namada-interface/issues/621)) ([c4e5413](https://github.com/anoma/namada-interface/commit/c4e54131064b1d7df3704a0f815cd041dc551740))


### Bug Fixes

* fix tests ([d49bd66](https://github.com/anoma/namada-interface/commit/d49bd66a00556205374fe19a092a36717d7ba75a))
* linting and TypeScript errors ([82eb87e](https://github.com/anoma/namada-interface/commit/82eb87eeb8f96100f239c7ff1a6cc2e953fbfdac))
* move optional value to end of schema, no empty memo ([#1379](https://github.com/anoma/namada-interface/issues/1379)) ([ee49600](https://github.com/anoma/namada-interface/commit/ee496001aad9291e3bb224f91ac5caf31a1143db))
* SDK and extension should use the same ledger-namada package ([#1376](https://github.com/anoma/namada-interface/issues/1376)) ([7fa916b](https://github.com/anoma/namada-interface/commit/7fa916b049b2dacc9b9dca7ee062319f8c2bee5a))
* updating imports for consistency ([#1325](https://github.com/anoma/namada-interface/issues/1325)) ([ae2b4eb](https://github.com/anoma/namada-interface/commit/ae2b4eb0d5aa8f464cd8752404742359702210d4))

## 0.12.0 (2024-12-02)


### Features

* add support for IBC deposits to shielded ([#1163](https://github.com/anoma/namada-interface/issues/1163)) ([50d8e61](https://github.com/anoma/namada-interface/commit/50d8e61374c39c9a89afab183ee87f87d4c0a561))
* allow Sdk to update itself, regen docs ([#861](https://github.com/anoma/namada-interface/issues/861)) ([ce1562b](https://github.com/anoma/namada-interface/commit/ce1562bf9ca61fe8a7372a74963ea616bc0ce129))
* bump to 0.39.0, specify transparent transfer in types ([#858](https://github.com/anoma/namada-interface/issues/858)) ([3ad6200](https://github.com/anoma/namada-interface/commit/3ad620045a6c2c51dda7be0ccc1a2e88b54a959e))
* enable IBC withdrawals for all tokens ([#1243](https://github.com/anoma/namada-interface/issues/1243)) ([14106eb](https://github.com/anoma/namada-interface/commit/14106eba676c38cc3fee379221359557c5758da2)), closes [#1242](https://github.com/anoma/namada-interface/issues/1242) [#1222](https://github.com/anoma/namada-interface/issues/1222)
* fetch and load masp params ([#1136](https://github.com/anoma/namada-interface/issues/1136)) ([5df8577](https://github.com/anoma/namada-interface/commit/5df8577cf0627247a7aeb5fa4de5e3970049b024))
* hook up interface to SDK package, extension signing ([1e2ad8e](https://github.com/anoma/namada-interface/commit/1e2ad8e4ff3c64451e94d36ef9559180fbcd27c5))
* hook up tx hash to build Tx, add to SDK ([#753](https://github.com/anoma/namada-interface/issues/753)) ([35909e7](https://github.com/anoma/namada-interface/commit/35909e7a2cdba35fea0f0af46b8628de240d420e))
* **interface:** fixing namadillo dev serve ([c66af51](https://github.com/anoma/namada-interface/commit/c66af51f59c6b4d611e0c69911e73e6605678191))
* move sdk package into [@namada](https://github.com/namada) org ([#1230](https://github.com/anoma/namada-interface/issues/1230)) ([0376020](https://github.com/anoma/namada-interface/commit/0376020411a6b123376a39bce4240bb7468858ae))
* sdk api improvements ([#695](https://github.com/anoma/namada-interface/issues/695)) ([6eee06c](https://github.com/anoma/namada-interface/commit/6eee06cb2b40eac8bd2eebc399fc87698654aaa1))
* sdk js publish ([#665](https://github.com/anoma/namada-interface/issues/665)) ([ec3dec8](https://github.com/anoma/namada-interface/commit/ec3dec8070219f29ccf95e8a50c880da3f032566))
* sdk version bump, changelog ([#1175](https://github.com/anoma/namada-interface/issues/1175)) ([f70a6a4](https://github.com/anoma/namada-interface/commit/f70a6a4c1e1d8ddef3e2985ec16295c666f4c95b))
* shield nam ([#1165](https://github.com/anoma/namada-interface/issues/1165)) ([e6b5530](https://github.com/anoma/namada-interface/commit/e6b55307c77312a3bdde192ec721d5e84883d4ba))
* support claim rewards tx in SDK ([#932](https://github.com/anoma/namada-interface/issues/932)) ([59d0ea9](https://github.com/anoma/namada-interface/commit/59d0ea9659658c23c804324d46594783ed695a2e)), closes [#679](https://github.com/anoma/namada-interface/issues/679)
* support decoding ibc tx details in sdk ([#1174](https://github.com/anoma/namada-interface/issues/1174)) ([1bd083b](https://github.com/anoma/namada-interface/commit/1bd083ba5883a3f722a6838b9694223afeae71a1))
* update unbonding period calculation ([#1034](https://github.com/anoma/namada-interface/issues/1034)) ([2e65ae8](https://github.com/anoma/namada-interface/commit/2e65ae8ae3d2430b6268603785c30016d2df77a6))
* update zip32 path ([#621](https://github.com/anoma/namada-interface/issues/621)) ([c4e5413](https://github.com/anoma/namada-interface/commit/c4e54131064b1d7df3704a0f815cd041dc551740))


### Bug Fixes

* fix tests ([d49bd66](https://github.com/anoma/namada-interface/commit/d49bd66a00556205374fe19a092a36717d7ba75a))
* linting and TypeScript errors ([82eb87e](https://github.com/anoma/namada-interface/commit/82eb87eeb8f96100f239c7ff1a6cc2e953fbfdac))
* updating imports for consistency ([#1325](https://github.com/anoma/namada-interface/issues/1325)) ([ae2b4eb](https://github.com/anoma/namada-interface/commit/ae2b4eb0d5aa8f464cd8752404742359702210d4))

## 0.10.0 (2024-10-11)


### Features

* allow Sdk to update itself, regen docs ([#861](https://github.com/anoma/namada-interface/issues/861)) ([ce1562b](https://github.com/anoma/namada-interface/commit/ce1562bf9ca61fe8a7372a74963ea616bc0ce129))
* bump to 0.39.0, specify transparent transfer in types ([#858](https://github.com/anoma/namada-interface/issues/858)) ([3ad6200](https://github.com/anoma/namada-interface/commit/3ad620045a6c2c51dda7be0ccc1a2e88b54a959e))
* fetch and load masp params ([#1136](https://github.com/anoma/namada-interface/issues/1136)) ([5df8577](https://github.com/anoma/namada-interface/commit/5df8577cf0627247a7aeb5fa4de5e3970049b024))
* hook up interface to SDK package, extension signing ([1e2ad8e](https://github.com/anoma/namada-interface/commit/1e2ad8e4ff3c64451e94d36ef9559180fbcd27c5))
* hook up tx hash to build Tx, add to SDK ([#753](https://github.com/anoma/namada-interface/issues/753)) ([35909e7](https://github.com/anoma/namada-interface/commit/35909e7a2cdba35fea0f0af46b8628de240d420e))
* **interface:** fixing namadillo dev serve ([c66af51](https://github.com/anoma/namada-interface/commit/c66af51f59c6b4d611e0c69911e73e6605678191))
* sdk api improvements ([#695](https://github.com/anoma/namada-interface/issues/695)) ([6eee06c](https://github.com/anoma/namada-interface/commit/6eee06cb2b40eac8bd2eebc399fc87698654aaa1))
* sdk js publish ([#665](https://github.com/anoma/namada-interface/issues/665)) ([ec3dec8](https://github.com/anoma/namada-interface/commit/ec3dec8070219f29ccf95e8a50c880da3f032566))
* support claim rewards tx in SDK ([#932](https://github.com/anoma/namada-interface/issues/932)) ([59d0ea9](https://github.com/anoma/namada-interface/commit/59d0ea9659658c23c804324d46594783ed695a2e)), closes [#679](https://github.com/anoma/namada-interface/issues/679)
* update unbonding period calculation ([#1034](https://github.com/anoma/namada-interface/issues/1034)) ([2e65ae8](https://github.com/anoma/namada-interface/commit/2e65ae8ae3d2430b6268603785c30016d2df77a6))
* update zip32 path ([#621](https://github.com/anoma/namada-interface/issues/621)) ([c4e5413](https://github.com/anoma/namada-interface/commit/c4e54131064b1d7df3704a0f815cd041dc551740))


### Bug Fixes

* fix tests ([d49bd66](https://github.com/anoma/namada-interface/commit/d49bd66a00556205374fe19a092a36717d7ba75a))
* linting and TypeScript errors ([82eb87e](https://github.com/anoma/namada-interface/commit/82eb87eeb8f96100f239c7ff1a6cc2e953fbfdac))
