import { jest } from "@jest/globals";
import { AnyAction } from "redux";
import createMockStore from "redux-mock-store";
import thunk, { ThunkDispatch } from "redux-thunk";
import { RootState } from "store/store";
import { mockAppState } from "store/mocks";
import { updateShieldedBalances } from "../actions";
import { ShieldedAccount } from "slices/accounts";
import { AccountErrors } from "../types";

// imports containing mocked units
import * as shieldedTransfer from "slices/shieldedTransfer";
jest.mock("slices/shieldedTransfer");

type DispatchExts = ThunkDispatch<RootState, void, AnyAction>;
const middleware = [thunk];
const mockStore = createMockStore<RootState, DispatchExts>(middleware);
const store = mockStore(mockAppState);

describe("shielded balances", () => {
  describe("fetchContactPageContent", () => {
    beforeEach(() => {
      store.clearActions();
    });

    // this is not a focused case, but a very generic one just testing a happy path
    // of updateShieldedBalances.
    it("should behave as expected in happy path of updateShieldedBalances", async () => {
      // setup data
      const testChainId1 = "testChainId1";
      const testspendingKey1 = "testspendingKey1";
      const testBalanceAmount = 100;
      const shieldedAccountUuidInClient = "shieldedAccountUuidInClient1";
      const shieldedAccounts: {
        [key: string]: { [key: string]: ShieldedAccount };
      } = {
        testChainId1: {
          [shieldedAccountUuidInClient]: {
            chainId: "testChainId1",
            shieldedKeysAndPaymentAddress: {
              viewingKey: "viewingKey",
              spendingKey: testspendingKey1,
              paymentAddress: "paymentAddress",
            },
            isShielded: true,
            alias: "Namada",
            balance: 0,
            address: "this_should_be_the_current_masp_address",
            tokenType: "ETH",
            signingKey: "signingKey",
            publicKey: "publicKey",
            id: shieldedAccountUuidInClient,
          },
        },
      };
      // we create this here and set in the mocked function below to be able to assert that
      // it was called with the right data
      let expectedChainId;
      let expectedSpendingKey;

      const store = mockStore({
        ...mockAppState,
        settings: { ...mockAppState.settings, chainId: testChainId1 },
        accounts: {
          ...mockAppState.accounts,
          shieldedAccounts: shieldedAccounts,
        },
      });
      // let's define a mock function that our action is calling
      jest
        .spyOn(shieldedTransfer, "getShieldedBalance")
        .mockImplementation(
          async (
            chainId: string,
            inputAddress: string,
            _tokenAddress: string
          ): Promise<string> => {
            // we want to assert later that the correct values are being passed from the action
            expectedChainId = chainId;
            expectedSpendingKey = inputAddress;

            // we return the test balance amount
            return Promise.resolve(`${testBalanceAmount}`);
          }
        );

      // run unit under test
      await store.dispatch(updateShieldedBalances());

      // assert results
      // ensure that the parameter was correctly passed from action to a dependency
      expect(expectedChainId).toEqual(testChainId1);
      expect(expectedSpendingKey).toEqual(testspendingKey1);

      // then ensure that the actions was resolving with expected results
      const actionsReceivedByStore = await store.getActions();
      expect(actionsReceivedByStore[0].type).toEqual(
        updateShieldedBalances.pending.type
      );
      expect(actionsReceivedByStore[1].type).toEqual(
        updateShieldedBalances.fulfilled.type
      );

      // lets get the returned balance of the account from the payload
      const balanceOfShieldedAccountUuidInClient =
        actionsReceivedByStore[1].payload.shieldedBalances[
          shieldedAccountUuidInClient
        ];
      expect(balanceOfShieldedAccountUuidInClient).toEqual(testBalanceAmount);
      expect(balanceOfShieldedAccountUuidInClient).not.toEqual(
        `${testBalanceAmount}`
      );
    });

    it("should behave as expected in faulty response from wasm call in updateShieldedBalances", async () => {
      // setup data
      const testChainId1 = "testChainId1";
      const testBalanceAmount = "aaa";
      const shieldedAccountUuidInClient = "shieldedAccountUuidInClient1";
      const shieldedAccounts: {
        [key: string]: { [key: string]: ShieldedAccount };
      } = {
        testChainId1: {
          [shieldedAccountUuidInClient]: {
            chainId: testChainId1,
            shieldedKeysAndPaymentAddress: {
              viewingKey: "viewingKey",
              spendingKey: "testspendingKey1",
              paymentAddress: "paymentAddress",
            },
            isShielded: true,
            alias: "Namada",
            balance: 0,
            address: "this_should_be_the_current_masp_address",
            tokenType: "ETH",
            signingKey: "signingKey",
            publicKey: "publicKey",
            id: shieldedAccountUuidInClient,
          },
        },
      };
      // we create this here and set in the mocked function below to be able to assert that
      // it was called with the right data

      const store = mockStore({
        ...mockAppState,
        settings: { ...mockAppState.settings, chainId: testChainId1 },
        accounts: {
          ...mockAppState.accounts,
          shieldedAccounts: shieldedAccounts,
        },
      });
      // let's define a mock function that our action is calling
      jest
        .spyOn(shieldedTransfer, "getShieldedBalance")
        .mockImplementation(
          async (
            _chainId: string,
            _inputAddress: string,
            _tokenAddress: string
          ): Promise<string> => {
            // we return the test balance amount
            return Promise.resolve(`${testBalanceAmount}`);
          }
        );

      // run unit under test
      await store.dispatch(updateShieldedBalances());

      // then ensure that the actions was resolving with expected results
      const actionsReceivedByStore = await store.getActions();
      expect(actionsReceivedByStore[0].type).toEqual(
        updateShieldedBalances.pending.type
      );
      expect(actionsReceivedByStore[1].type).toEqual(
        updateShieldedBalances.fulfilled.type
      );

      // lets get the returned balance of the account from the payload
      const balanceOfShieldedAccountUuidInClient =
        actionsReceivedByStore[1].payload.shieldedBalances[
          shieldedAccountUuidInClient
        ];
      expect(balanceOfShieldedAccountUuidInClient).toEqual(
        AccountErrors.NonNumericShieldedBalanceReturned
      );
    });

    it("should behave as expected when the action throws", async () => {
      // setup data
      const testChainId1 = "testChainId1";
      const testBalanceAmount = "aaa";
      const shieldedAccountUuidInClient = "shieldedAccountUuidInClient1";
      const shieldedAccounts: {
        [key: string]: { [key: string]: ShieldedAccount };
      } = {
        [testChainId1 + "wrong_key"]: {
          [shieldedAccountUuidInClient]: {
            chainId: testChainId1,
            shieldedKeysAndPaymentAddress: {
              viewingKey: "viewingKey",
              spendingKey: "testspendingKey1",
              paymentAddress: "paymentAddress",
            },
            isShielded: true,
            alias: "Namada",
            balance: 0,
            address: "this_should_be_the_current_masp_address",
            tokenType: "ETH",
            signingKey: "signingKey",
            publicKey: "publicKey",
            id: shieldedAccountUuidInClient,
          },
        },
      };
      // we create this here and set in the mocked function below to be able to assert that
      // it was called with the right data

      const store = mockStore({
        ...mockAppState,
        settings: { ...mockAppState.settings, chainId: testChainId1 },
        accounts: {
          ...mockAppState.accounts,
          shieldedAccounts: shieldedAccounts,
        },
      });
      // let's define a mock function that our action is calling
      jest
        .spyOn(shieldedTransfer, "getShieldedBalance")
        .mockImplementation(
          async (
            _chainId: string,
            _inputAddress: string,
            _tokenAddress: string
          ): Promise<string> => {
            // we return the test balance amount
            return Promise.resolve(`${testBalanceAmount}`);
          }
        );

      // run unit under test
      await store.dispatch(updateShieldedBalances());

      // then ensure that the actions was resolving with expected results
      const actionsReceivedByStore = await store.getActions();
      expect(actionsReceivedByStore[0].type).toEqual(
        updateShieldedBalances.pending.type
      );
      expect(actionsReceivedByStore[1].type).toEqual(
        updateShieldedBalances.rejected.type
      );
      expect(actionsReceivedByStore[1].payload).toEqual(
        AccountErrors.RetrievingShieldedBalancesFailed
      );
    });
  });
});
