import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import tabReducer from "./slices/tabslice";
import loadingReducer from "./slices/loadingSlice";

export const store = configureStore({
    reducer:{
        auth:authReducer,
        tab:tabReducer,
        loading: loadingReducer
    }
})