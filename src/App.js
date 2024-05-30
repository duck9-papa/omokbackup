import logo from "./logo.svg";
import "./App.css";
import { useDispatch, useSelector } from "react-redux";
import { Route, Routes } from "react-router-dom";
import CommonPage from "./page/CommonPage";
import LoginPage from "./page/LoginPage";
import { useEffect, useRef } from "react";
import { getLogin } from "./slices/LoginInfoSlice";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

function App() {
  const { status } = useSelector(state => state.LoginInfoSlice);
  const { roomId, message, users } = useSelector(state => state.OmokSlice);

  const dispatch = useDispatch();
  useEffect(() => {
    if (roomId) {
      const ExitMessage = () => {
        const docRef = doc(db, "game", `room${roomId}`);
        const lastOrder = message[0]?.order + 1 || 1;
        const userId = localStorage.getItem("id");
        const nickname = localStorage.getItem("nickname");
        const newMessage = {
          text: `${nickname}님이 퇴장하였습니다.`,
          order: lastOrder,
          userId,
          nickname,
        };
        const remainUsers = users.filter(i => i.userId !== userId);
        updateDoc(docRef, {
          message: arrayUnion(newMessage),
          users: remainUsers,
        });
      };

      window.addEventListener("beforeunload", ExitMessage);

      return () => window.removeEventListener("beforeunload", ExitMessage);
    }
  }, [roomId, message, users]);
  useEffect(() => {
    const id = localStorage.getItem("id");
    const nickname = localStorage.getItem("nickname");
    if (id && nickname) {
      dispatch(getLogin({ userId: id, nickname }));
    }
  }, [dispatch]);
  return (
    <Routes>
      {status ? (
        <Route path="/" element={<CommonPage />} />
      ) : (
        <Route path="/" element={<LoginPage />} />
      )}
    </Routes>
  );
}

export default App;
