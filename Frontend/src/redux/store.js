import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import jobReducer from "./jobSlice";
import companyReducer from "./companyslice";
import applicationReducer from "./applicationSlice";
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
  { whitelist: ["job"] }
);

const persistConfig = {
  key: "root",
  version: 2,
  storage,
  transforms: [jobVolatileTransform],
};

const rootReducer = combineReducers({
  auth: authReducer,
  job: jobReducer,
  company: companyReducer,
  application: applicationReducer,
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
