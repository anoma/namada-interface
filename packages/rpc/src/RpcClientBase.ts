abstract class RpcClientBase {
  private _url: string;

  constructor(url: string) {
    this._url = url;
  }

  // TODO: We can possibly just remove this whole class, as we will no longer have a SocketClient,
  // so a base class makes little sense, and everything can be simply defined in RpcClient.
  protected get endpoint(): string {
    return this._url;
  }
}

export default RpcClientBase;
