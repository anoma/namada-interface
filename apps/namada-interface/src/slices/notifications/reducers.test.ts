import { NotificationsState, ToastTimeout, ToastType } from "./types";
import reducer, { actions } from "./slice";
import { THUNK_MATCH_REGEXP } from "./reducers";
import {
  UnknownAsyncThunkFulfilledAction,
  UnknownAsyncThunkPendingAction,
  UnknownAsyncThunkRejectedAction,
} from "@reduxjs/toolkit/dist/matchers";
import { Action } from "@reduxjs/toolkit";

describe("Notifications reducers", () => {
  describe("createToast", () => {
    it("should add new toast if toasts are empty", () => {
      const state: NotificationsState = {
        toasts: {},
        pendingActions: ["action"],
      };
      const data = {
        title: "A",
        message: "B",
        type: "info" as ToastType,
        timeout: ToastTimeout.Default(),
      };
      const id = "some-id";
      const createToastAction = actions.createToast({
        id,
        data,
      });

      expect(reducer(state, createToastAction)).toEqual({
        toasts: { [id]: data },
        pendingActions: ["action"],
      });
    });

    it("should set default timeout if none is specified", () => {
      const state: NotificationsState = {
        toasts: {},
        pendingActions: [],
      };
      const data = {
        title: "A",
        message: "B",
        type: "info" as ToastType,
      };
      const id = "some-id";
      const createToastAction = actions.createToast({
        id,
        data,
      });

      expect(reducer(state, createToastAction)).toEqual({
        toasts: { [id]: { ...data, timeout: ToastTimeout.Default() } },
        pendingActions: [],
      });
    });

    it("should add new toast if toasts are not empty", () => {
      const initialToast = {
        ["some-other-id"]: {
          title: "A",
          message: "B",
          type: "error" as ToastType,
          timeout: ToastTimeout.Default(),
        },
      };
      const state: NotificationsState = {
        toasts: { ...initialToast },
        pendingActions: [],
      };
      const data = {
        title: "A",
        message: "B",
        type: "info" as ToastType,
        timeout: ToastTimeout.Default(),
      };
      const id = "some-id";
      const createToastAction = actions.createToast({
        id,
        data,
      });

      expect(reducer(state, createToastAction)).toEqual({
        toasts: { ...initialToast, [id]: data },
        pendingActions: [],
      });
    });

    it("should replace toast with the same id", () => {
      const id = "some-id";
      const initialToast = {
        [id]: {
          title: "A",
          message: "B",
          type: "error" as ToastType,
          timeout: ToastTimeout.Default(),
        },
      };
      const state: NotificationsState = {
        toasts: { ...initialToast },
        pendingActions: [],
      };
      const data = {
        title: "A",
        message: "B",
        type: "info" as ToastType,
        timeout: ToastTimeout.Default(),
      };
      const createToastAction = actions.createToast({
        id,
        data,
      });

      expect(reducer(state, createToastAction)).toEqual({
        toasts: { [id]: data },
        pendingActions: [],
      });
    });
  });

  describe("removeToast", () => {
    it("should remove existing toast", () => {
      const id = "some-id";
      const initialToast = {
        [id]: {
          title: "A",
          message: "B",
          type: "error" as ToastType,
          timeout: ToastTimeout.Default(),
        },
      };
      const state: NotificationsState = {
        toasts: { ...initialToast },
        pendingActions: [],
      };

      const removeToastAction = actions.removeToast({
        id,
      });

      expect(reducer(state, removeToastAction)).toEqual({
        toasts: {},
        pendingActions: [],
      });
    });

    it("should do nothing when toast with given id is not present", () => {
      const id = "some-id";
      const initialToast = {
        [id]: {
          title: "A",
          message: "B",
          type: "error" as ToastType,
          timeout: ToastTimeout.Default(),
        },
      };
      const state: NotificationsState = {
        toasts: { ...initialToast },
        pendingActions: [],
      };

      const removeToastAction = actions.removeToast({
        id: "different-id",
      });

      expect(reducer(state, removeToastAction)).toEqual(state);
    });
  });

  describe("setPendingAction", () => {
    it("should add pending action if not present", () => {
      const state: NotificationsState = {
        toasts: {},
        pendingActions: [],
      };
      const pendingAction = {
        type: "A/name/pending",
        meta: {
          requestId: "A",
          requestStatus: "pending",
        },
      } as UnknownAsyncThunkPendingAction;

      expect(reducer(state, pendingAction)).toEqual({
        toasts: {},
        pendingActions: ["A/name"],
      });
    });

    it("should not add pending action if present", () => {
      const action = "A/name";
      const state: NotificationsState = {
        toasts: {},
        pendingActions: [action],
      };
      const pendingAction = {
        type: `${action}/pending`,
        meta: {
          requestId: "A",
          requestStatus: "pending",
        },
      } as UnknownAsyncThunkPendingAction;

      expect(reducer(state, pendingAction)).toEqual({
        toasts: {},
        pendingActions: ["A/name"],
      });
    });

    it("should clear pending action if it is fulfilled", () => {
      const actionType = "A/name";
      const state: NotificationsState = {
        toasts: {},
        pendingActions: [actionType],
      };
      const pendingAction = {
        type: `${actionType}/fulfilled`,
        meta: {
          requestId: "A",
          requestStatus: "fulfilled",
        },
      } as UnknownAsyncThunkFulfilledAction;

      expect(reducer(state, pendingAction)).toEqual({
        toasts: {},
        pendingActions: [],
      });
    });

    it("should clear pending action if it is rejected", () => {
      const actionType = "A/name";
      const state: NotificationsState = {
        toasts: {},
        pendingActions: [actionType],
      };
      const pendingAction = {
        type: `${actionType}/rejected`,
        meta: {
          requestId: "A",
          requestStatus: "rejected",
        },
      } as UnknownAsyncThunkRejectedAction;

      expect(reducer(state, pendingAction)).toEqual({
        toasts: {},
        pendingActions: [],
      });
    });

    it("should do nothing if actionType is not matched", () => {
      const actionType = "A/name";
      const state: NotificationsState = {
        toasts: {},
        pendingActions: [actionType],
      };
      const pendingAction = {
        type: "some action",
      } as Action;

      expect(reducer(state, pendingAction)).toEqual({
        toasts: {},
        pendingActions: ["A/name"],
      });
    });
  });
});

describe("Thunk match regexp", () => {
  it("should not match empty string", () => {
    expect("".match(THUNK_MATCH_REGEXP)).toBeNull();
  });

  it("should not match a string without a slash('/')", () => {
    expect("hello".match(THUNK_MATCH_REGEXP)).toBeNull();
  });

  it("should not match a string with a slash('/') and arbitrary chars after", () => {
    expect("hello/world".match(THUNK_MATCH_REGEXP)).toBeNull();
  });

  it("should not match a string with multiple slashes('/') and arbitrary chars after", () => {
    expect("hello/world/!!!".match(THUNK_MATCH_REGEXP)).toBeNull();
  });

  it("should match a string with a slash('/') followed by pending/fulfilled/rejected", () => {
    expect("hello/pending".match(THUNK_MATCH_REGEXP)?.[0]).toEqual("hello");
    expect("hello/fulfilled".match(THUNK_MATCH_REGEXP)?.[0]).toEqual("hello");
    expect("hello/rejected".match(THUNK_MATCH_REGEXP)?.[0]).toEqual("hello");
  });

  it("should match a string with multiple slashes('/') followed by pending/fulfilled/rejected", () => {
    expect("hello/world/pending".match(THUNK_MATCH_REGEXP)?.[0]).toEqual(
      "hello/world"
    );
    expect(
      "hello/world/action/fulfilled".match(THUNK_MATCH_REGEXP)?.[0]
    ).toEqual("hello/world/action");
    expect(
      "hello/world/action/more-action/rejected".match(THUNK_MATCH_REGEXP)?.[0]
    ).toEqual("hello/world/action/more-action");
  });
});
