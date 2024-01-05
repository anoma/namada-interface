# @anoma/e2e
Package containing extension and web interface e2e tests.

## Development
- run `yarn setup` which builds extension and web interface with `--watch` flag
- wait for setup to finish
- run `yarn test` or `yarn test:watch`

## CI
- WIP :)

## Other stuff
- **So far only works for namada 0.19** - you can change version in `./setup-namada.sh`
- **So far downloads MASP params every time we load extension**
- **Namada binaries, wasm checksums and wasms are cached** - they will dl again only if namada version changes

### Helper scripts
`./setup-frontend.sh`
  - builds extension and web interface with `--watch` flag
`./setup-namada.sh`
  - if needed downloads namada binaries, wasm checksums.json file and wasm files from s3
  - initializes the chain
  - reads chain id of the initialized chain, copies wasm files and replaces chain id in built extension and web interface files[^1]
`./start-namada.sh`
  - starts namada with the current chain id 

### Writing tests
If you write a test that needs namada running you have to consider few things:
- you need to setup namada **before** puppeteer loads the extension. Otherwise there would be a chain id mismatch and things like transfers will not work. 
- you need to be sure that there is only one test using namada running at the same time. The reason is the same as above. This is something that can change in future. We need to figure out how many instances of namada we want to run at the same time.
- make sure that you stop namada process after test(s) are done

You can use predefined values in `utils/values` and addresses defined in `genesis.toml` for quicker test setup.


[^1]: We do this so we do not have to rebuild extension/web interface every time we reinitialize the chain. Unfortunately we can not force namada to initialize with the same chain id all the time.
