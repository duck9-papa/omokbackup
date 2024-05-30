import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userId: "",
  nickname: "",
  currentRoom: "",
  status: false,
};

const LoginInfoSlice = createSlice({
  name: "LoginInfoSlice",
  initialState,
  reducers: {
    infoAction: (state, action) => {
      const { target, value } = action.payload;
      state[target] = value;
    },
    getLogin: (state, action) => {
      const { userId, nickname } = action.payload;
      state.status = true;
      state.userId = userId;
      state.nickname = nickname;
    },
  },
  extraReducers: builder => {},
});

export const { infoAction, getLogin } = LoginInfoSlice.actions;

export default LoginInfoSlice.reducer;
