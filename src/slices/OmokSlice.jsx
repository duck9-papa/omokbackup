import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../firebase";
import boardObj from "../common/CommonBoard";
// 스테이트 초기 값
const initialState = {
  board: boardObj,
  boardArr: [],
  keys: Object.keys(boardObj),
  message: [],
  roomId: "",
  gameMode: "",
  wordMatchs: [],
  epilogueMatchs: [],
  initialConsonant: "",
  searchWord: "",
  searchResults: [],
  users: [],
  davinciCode: {
    davinciCodeArr: [],
    davinciCodeGameStatus: false,
    davinciCodeUsers: [],
    gameStatus: false,
    turnUser: "",
    selectCard: {},
  },
  submitValue: null,
};

export const BoardGetThunk = createAsyncThunk(
  "BoardGetThunk",
  async (payload, thunkAPI) => {
    try {
      const querySnapshot = await getDocs(collection(db, "game"));
      const boardArr = querySnapshot.docs.map(doc => doc.data())?.[0]?.board;
      // 성공했을 때 extraReducers로 보낼 데이터
      const board = { ...boardObj };

      boardArr?.forEach(i => {
        board[i.location] = i;
      });

      return thunkAPI.fulfillWithValue({ board, boardArr });
    } catch {
      // 실패했을 때 extraReducers로 보낼 데이터
      return thunkAPI.rejectWithValue();
    }
  }
);

export const BoardSetThunk = createAsyncThunk(
  "BoardSetThunk",
  async (payload, thunkAPI) => {
    const { stone } = payload;
    const roomId = thunkAPI.getState().OmokSlice.roomId;
    try {
      const docRef = doc(db, "game", `room${roomId}`);
      await updateDoc(docRef, {
        board: arrayUnion(stone),
      });
    } catch {
      // 실패했을 때 extraReducers로 보낼 데이터
      return thunkAPI.rejectWithValue();
    }
  }
);

export const BoardResetThunk = createAsyncThunk(
  "BoardResetThunk",
  async (payload, thunkAPI) => {
    try {
      const roomId = thunkAPI.getState().OmokSlice.roomId;
      const docRef = doc(db, "game", `room${roomId}`);
      await updateDoc(docRef, {
        board: [],
      });
    } catch {
      // 실패했을 때 extraReducers로 보낼 데이터
      return thunkAPI.rejectWithValue();
    }
  }
);

const OmokSlice = createSlice({
  name: "OmokSlice",
  initialState,
  reducers: {
    commonAction: (state, action) => {
      const { target, value } = action.payload;
      state[target] = value;
    },
    updateBoard: (state, action) => {
      const { boardArr } = action.payload;
      const board = { ...boardObj };

      boardArr?.forEach(i => {
        board[i.location] = i;
      });
      state.board = board;
      state.boardArr = boardArr;
      if (!boardArr?.length) {
        localStorage.setItem("side", "");
      }
    },
    updatemessage: (state, action) => {
      const { message } = action.payload;
      const sortMessage = message.sort((a, b) => b?.order - a?.order);
      state.message = sortMessage;
    },
    joinRoom: (state, action) => {
      const { roomId } = action.payload;
      state.roomId = roomId;
    },
    changeMode: (state, action) => {
      const { gameMode } = action.payload;
      state.gameMode = gameMode;
    },
    firstJoin: (state, action) => {
      const { firstData } = action.payload;
      Object.keys(firstData).forEach(i => {
        state[i] = firstData[i];
      });
    },
  },
  extraReducers: builder => {},
});

// reducers에 액션을 추가하면 여기에 추가
export const {
  updateBoard,
  updatemessage,
  joinRoom,
  changeMode,
  firstJoin,
  commonAction,
} = OmokSlice.actions;

// 슬라이스 만든 후에 configStore 에서 import 하고 combineReducers 객체 안에 추가
export default OmokSlice.reducer;
