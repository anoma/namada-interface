import { ResultCode, ResultCodes, TxResponseProps } from "./tx";

/**
 * Custom error for Broadcast Tx
 */
export class BroadcastTxError extends Error {
  /**
   * @param message - string
   * @returns BroadcastTxError
   */
  constructor(message: string) {
    super(message);
    this.name = "BroadcastTxError";
  }

  /**
   * @returns string
   */
  toString(): string {
    try {
      const { code } = this.toProps();
      const message = ResultCodes[code as ResultCode];
      return message;
      // eslint-disable-next-line
    } catch (_) {
      // If not able to be parsed as JSON, return
      // original error message
      return this.message;
    }
  }

  /**
   * @returns TxResponseProps
   */
  toProps(): TxResponseProps {
    try {
      const props = JSON.parse(this.message) as TxResponseProps;
      return props;
    } catch (e) {
      throw new Error(`${e}`);
    }
  }
}
