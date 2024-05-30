import { configureStore, combineReducers } from "@reduxjs/toolkit";
import OmokSlice from "./OmokSlice";
import LoginInfoSlice from "./LoginInfoSlice";

const rootReducer = combineReducers({
  OmokSlice,
  LoginInfoSlice,
});

const configStore = configureStore({
  reducer: rootReducer,
  devTools: true,
});

export default configStore;
