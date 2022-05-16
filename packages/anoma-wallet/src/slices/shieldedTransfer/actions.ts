// import { createAsyncThunk } from "@reduxjs/toolkit";
// import { CREATE } from "./types";
// import { createShieldedTransaction } from "./utils";

// // exposes an action to create ShieldedTransactions
// export const createShieldedTransactionAction = createAsyncThunk(
//   CREATE,
//   async (_placeholder: string, { dispatch, rejectWithValue }) => {
//     try {
//       const shieldedTransfer = createShieldedTransaction(1);
//       return shieldedTransfer;
//     } catch (_error) {
//       rejectWithValue(-1);
//     }
//     return 1;
//   }
// );

export {};
