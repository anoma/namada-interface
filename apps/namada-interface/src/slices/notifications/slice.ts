import { createSlice } from "@reduxjs/toolkit";

import { NotificationsState } from "./types";
import { reducers, extraReducers } from "./reducers";

const initialState: NotificationsState = {
  toasts: {},
  pendingActions: [],
};

const NOTIFICATIONS_ACTIONS_BASE = "notifications";

export const NotificationsSlice = createSlice({
  name: NOTIFICATIONS_ACTIONS_BASE,
  initialState,
  reducers,
  extraReducers,
});

export const actions = NotificationsSlice.actions;

export default NotificationsSlice.reducer;
