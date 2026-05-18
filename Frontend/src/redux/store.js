import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import jobSlice from "./jobSlice";
import jobReducer from "./jobSlice";
import { createRoot } from "react-dom/client";
import { companySlice } from "./companyslice";
import companyReducer from "./companyslice";

import {
  persistStore,
  persistReducer,
  createTransform,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import applicationSlice from "./applicationSlice";

/** Avoid stale empty persisted lists; always refetch applied jobs / job detail from API */
const jobVolatileTransform = createTransform(
  (inboundState) =>
    inboundState
      ? { ...inboundState, allAppliedJobs: [], singleJob: null }
      : inboundState,
  (outboundState) =>
    outboundState
      ? { ...outboundState, allAppliedJobs: [], singleJob: null }
      : outboundState,
  { whitelist: ["job", "jobs"] }
);

const persistConfig = {
  key: "root",
  version: 1,
  storage,
  transforms: [jobVolatileTransform],
};

const rootReducer = combineReducers({
  auth: authReducer,
  job: jobSlice,
  jobs: jobReducer,
  company: companySlice,
  company: companyReducer,
  application: applicationSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export default store;
