# Examples

## How to run

1. In the root of the sdk package run: `yarn build` - this might take a while as we build wasms(web and node) in production mode
2. Run example :)

## Example commands

### Query balance

```sh
yarn example queryBalance \
-n http://127.0.0.1:27657 \
-t tnam1qxgfw7myv4dh0qna4hq0xdg6lx77fzl7dcem8h7e \
--token tnam1qxgfw7myv4dh0qna4hq0xdg6lx77fzl7dcem8h7e \
--owner tnam1qqshvryx9pngpk7mmzpzkjkm6klelgusuvmkc0uz
```

### Submit transfer

```sh
yarn example submitTransfer \
-n http://127.0.0.1:27657 \
-t tnam1qxgfw7myv4dh0qna4hq0xdg6lx77fzl7dcem8h7e \
--source tnam1qqshvryx9pngpk7mmzpzkjkm6klelgusuvmkc0uz \
--target tnam1qz4sdx5jlh909j44uz46pf29ty0ztftfzc98s8dx \
--amount 100 \
--chainId localnet.a38cf62f63db8c1a1f3c9 \
--signingKey 0134eae1393f86a8da08bc476b89dc73eed9040095b604d347ceacc1b734b32b \
--publicKey tpknam1qzz3nvg5zjwdpk5z0x9ngkf7guv9qpqrtz0da7weenwl5766pkkgvvt689t
```
