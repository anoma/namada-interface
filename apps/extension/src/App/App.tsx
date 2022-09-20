import { useEffect } from "react";
import { ExtensionRequester } from "../extension";
import { GetChainsMsg } from "../background/chains";
import { Ports } from "../router";

const requester = new ExtensionRequester();

export const App = () => {
  useEffect(() => {
    (async () => {
      const results = await requester.sendMessage<GetChainsMsg>(
        Ports.Background,
        new GetChainsMsg()
      );

      console.log({ results });
    })();
  }, []);

  return (
    <div>
      <h1>Anoma Browser Extension</h1>
    </div>
  );
};
