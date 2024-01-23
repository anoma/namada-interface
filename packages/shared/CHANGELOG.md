

## 0.3.0 (2024-01-23)


### Features

* **138:** reveal pk ([#162](https://github.com/anoma/namada-interface/issues/162)) ([6ac8519](https://github.com/anoma/namada-interface/commit/6ac8519cb841c93af0861563fd163c58f7bc63d3))
* **144:** add test for extension message passing system ([#149](https://github.com/anoma/namada-interface/issues/149)) ([b96f884](https://github.com/anoma/namada-interface/commit/b96f8844345e4459056c59407287646bd530530a))
* account import ([#309](https://github.com/anoma/namada-interface/issues/309)) ([4faff7a](https://github.com/anoma/namada-interface/commit/4faff7a356a4f8653217794f8260e046afc6726c))
* add newline ([e472ef8](https://github.com/anoma/namada-interface/commit/e472ef8fcf968c2364fc6e0798a7b8553365326a))
* async masp params loading ([#305](https://github.com/anoma/namada-interface/issues/305)) ([eb16888](https://github.com/anoma/namada-interface/commit/eb168884005843eae64310b75bf67ec81bcba5a3))
* changelog for types ([bd0704c](https://github.com/anoma/namada-interface/commit/bd0704cf9772fdff4e60d2c64942de403232baff))
* cleanup memory on rust panic ([#317](https://github.com/anoma/namada-interface/issues/317)) ([779bb6a](https://github.com/anoma/namada-interface/commit/779bb6ab40523a6906c76bc0d55dc6c50068ca9f))
* do not decrypt mnemonic for auth ([#322](https://github.com/anoma/namada-interface/issues/322)) ([3110ff4](https://github.com/anoma/namada-interface/commit/3110ff4ef902b9162cc462335e58c5c047cf30ac))
* eth bridge transfer ([#382](https://github.com/anoma/namada-interface/issues/382)) ([01263b0](https://github.com/anoma/namada-interface/commit/01263b09de988cbde080776cf8e32c1bb0f0c615))
* fix unit tests ([#236](https://github.com/anoma/namada-interface/issues/236)) ([4215180](https://github.com/anoma/namada-interface/commit/4215180858746aa848be14195e0c85b227390d9d))
* implement asyn client trait ([#173](https://github.com/anoma/namada-interface/issues/173)) ([a234ec2](https://github.com/anoma/namada-interface/commit/a234ec2782734a479366ee4da61e740fc7e37d3a))
* implement web io ([#402](https://github.com/anoma/namada-interface/issues/402)) ([d91270f](https://github.com/anoma/namada-interface/commit/d91270ffc21b10a4338fbf38fb7d4454d721be5d))
* initialize masp params load from the extension ([#302](https://github.com/anoma/namada-interface/issues/302)) ([25aafbe](https://github.com/anoma/namada-interface/commit/25aafbe06e70c4141214a6b34a9edacf665e7148))
* masp with disposable key ([#538](https://github.com/anoma/namada-interface/issues/538)) ([0819762](https://github.com/anoma/namada-interface/commit/08197620bb9938aa15f3c2a9e39f557cf2239982))
* multicore ([#549](https://github.com/anoma/namada-interface/issues/549)) ([5528a7f](https://github.com/anoma/namada-interface/commit/5528a7f44150628ef19dc7de2c39a80aa66b7ee4))
* proposals ([#351](https://github.com/anoma/namada-interface/issues/351)) ([d6313ee](https://github.com/anoma/namada-interface/commit/d6313eea2976cdf97042e947b698ca636c366a80))
* reduce bundle size ([#530](https://github.com/anoma/namada-interface/issues/530)) ([6347c2f](https://github.com/anoma/namada-interface/commit/6347c2f81e880aa191bac65f99e9bcaab9128268)), closes [#1](https://github.com/anoma/namada-interface/issues/1) [#2](https://github.com/anoma/namada-interface/issues/2) [#3](https://github.com/anoma/namada-interface/issues/3)
* release changelog ([f3099b0](https://github.com/anoma/namada-interface/commit/f3099b0c0a96b0fb5f30689b2d97e52c24de07d5))
* Sdk integration ([#198](https://github.com/anoma/namada-interface/issues/198)) ([1d1a217](https://github.com/anoma/namada-interface/commit/1d1a217637d04155c549b115c27a93d8fae71645)), closes [#204](https://github.com/anoma/namada-interface/issues/204)
* send ibc transfer using sdk ([#213](https://github.com/anoma/namada-interface/issues/213)) ([76d49f8](https://github.com/anoma/namada-interface/commit/76d49f8d20c021c96553bf2187c4018de0037ab3))
* shielded balances ([#298](https://github.com/anoma/namada-interface/issues/298)) ([08d4a64](https://github.com/anoma/namada-interface/commit/08d4a640ff3b72219f9db0e98fd91007f31175c8))
* shielded transfers in WebWorker ([#283](https://github.com/anoma/namada-interface/issues/283)) ([5454ac8](https://github.com/anoma/namada-interface/commit/5454ac86c40bf6e9741e9e72f03e755a99e9106b)), closes [#286](https://github.com/anoma/namada-interface/issues/286)
* staking view integration ([#142](https://github.com/anoma/namada-interface/issues/142)) ([b4cc93e](https://github.com/anoma/namada-interface/commit/b4cc93edbd048f1dbfe0c0c3062c9a526c95e36c))
* support additional testnet tokens ([#529](https://github.com/anoma/namada-interface/issues/529)) ([17c378c](https://github.com/anoma/namada-interface/commit/17c378c8a259e827efcb75d6fb8b10c4309c850d))
* transfers from shielded addresses ([#291](https://github.com/anoma/namada-interface/issues/291)) ([2d818d0](https://github.com/anoma/namada-interface/commit/2d818d01e162dd24d60f11d251523c1c519e2378))
* unbound using sdk ([#211](https://github.com/anoma/namada-interface/issues/211)) ([d367c3d](https://github.com/anoma/namada-interface/commit/d367c3dfd8f071794702b747ab95185f62e1e7c7))
* update namada to 0.11.0 ([#158](https://github.com/anoma/namada-interface/issues/158)) ([a43ce14](https://github.com/anoma/namada-interface/commit/a43ce14644d2f121b854f5a483d2e3a8aac43990))
* update namada to 0.17.3 ([#312](https://github.com/anoma/namada-interface/issues/312)) ([bd88307](https://github.com/anoma/namada-interface/commit/bd88307601d5266933147df1cda408cacedef5bf))
* update namada to 0.18.0 ([#324](https://github.com/anoma/namada-interface/issues/324)) ([d0a9da8](https://github.com/anoma/namada-interface/commit/d0a9da882943925d5b8f88af8a894a99d9e49a13))
* update to namada 16 ([#275](https://github.com/anoma/namada-interface/issues/275)) ([51326ac](https://github.com/anoma/namada-interface/commit/51326acf925542ba24c756f9de89b16a0fa0b498))
* yarn publish ([#571](https://github.com/anoma/namada-interface/issues/571)) ([62bef6a](https://github.com/anoma/namada-interface/commit/62bef6ab4ddbd09c1c835aa06b6a3577a8b028d2))


### Bug Fixes

* build script ([9aaae1b](https://github.com/anoma/namada-interface/commit/9aaae1bda6c2c44e32f0f38e20c6404907ee6f06))
* keep sdk wallet storage entry by parent account id ([#308](https://github.com/anoma/namada-interface/issues/308)) ([27ef99f](https://github.com/anoma/namada-interface/commit/27ef99fc9b96c90718e65c65cf159b16da49e1f9))
* prefix environment variables ([#493](https://github.com/anoma/namada-interface/issues/493)) ([570f068](https://github.com/anoma/namada-interface/commit/570f068f85bab1446c98aabd89e2f2f73a4a2ade))
* print correct timeout in query timeout error message ([6e9b5ff](https://github.com/anoma/namada-interface/commit/6e9b5ff96c105000ce14115a8d21607fde306496))
* publish ([#573](https://github.com/anoma/namada-interface/issues/573)) ([ded0b77](https://github.com/anoma/namada-interface/commit/ded0b771d807531d4efe5bc0d6ff2549c79321f4))
* release ([8218536](https://github.com/anoma/namada-interface/commit/8218536a7bced883e50e492d185a0d2e582a3ab6))
