import React, { useEffect, useRef } from "react";
import OmokPage from "./OmokPage";
import ChatRoom from "./ChatRoom";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { changeMode, commonAction, updateBoard } from "../slices/OmokSlice";
import { db } from "../firebase";
import WordGamePage from "./WordGamePage";
import { Search } from "../Search";
import DavinciCodePage from "./davinciCode/DavinciCodePage";
const gameComponents = {
  오목: <OmokPage />,
  훈민정음: <WordGamePage />,
  끝말잇기: <WordGamePage />,
  다빈치코드: <DavinciCodePage />,
};

const CommonPage = () => {
  const { gameMode, roomId, searchWord } = useSelector(
    state => state.OmokSlice
  );
  // const { userId, nickname } = useSelector(state => state.LoginInfoSlice);

  const dispatch = useDispatch();
  const modeRef = useRef();
  const consotantRef = useRef("");

  useEffect(() => {
    if (searchWord) {
      const getResults = async () => {
        const results = await Search(searchWord).then(r => r.item);
        const item = results.filter(
          i => i.word?.replaceAll("-", "") === searchWord
        );
        const maps = item?.map(i => i?.sense[0]);
        dispatch(commonAction({ target: "searchResults", value: maps }));
      };
      getResults();
    }
  }, [dispatch, searchWord]);

  useEffect(() => {
    if (roomId) {
      const docRef = doc(db, "game", `room${roomId}`);
      const unsubscribe = onSnapshot(docRef, async querySnapshot => {
        if (querySnapshot.exists()) {
          const {
            board: boardArr,
            gameMode,
            epilogueMatchs,
            wordMatchs,
            initialConsonant,
            users,
            davinciCode,
          } = querySnapshot.data();
          if (consotantRef.current !== initialConsonant) {
            dispatch(
              commonAction({
                target: "initialConsonant",
                value: initialConsonant,
              })
            );
            consotantRef.current = initialConsonant;
          }
          dispatch(commonAction({ target: "users", value: users }));
          if (modeRef.current !== gameMode) {
            modeRef.current = gameMode;
            dispatch(changeMode({ gameMode }));
          }

          if (gameMode === "오목") {
            dispatch(updateBoard({ boardArr }));
          } else if (gameMode === "훈민정음") {
            const lastWord = wordMatchs[wordMatchs.length - 1]?.word;
            dispatch(commonAction({ target: "searchWord", value: lastWord }));
            dispatch(commonAction({ target: "wordMatchs", value: wordMatchs }));
          } else if (gameMode === "끝말잇기") {
            const lastWord = epilogueMatchs[epilogueMatchs.length - 1]?.word;
            dispatch(commonAction({ target: "searchWord", value: lastWord }));
            dispatch(
              commonAction({
                target: "epilogueMatchs",
                value: epilogueMatchs,
              })
            );
          } else if (gameMode === "다빈치코드") {
            dispatch(
              commonAction({ target: "davinciCode", value: davinciCode })
            );
          }
        } else {
          try {
            await setDoc(docRef, {
              message: [],
              board: [],
              gameMode: "",
              wordMatchs: [],
              epilogueMatchs: [],
              initialConsonant: "",
              davinciCode: {
                davinciCodeArr: [],
                davinciCodeUsers: [],
                gameStatus: false,
                turnUser: {},
                selectCard: {},
                turnStep: 0,
              },

              users: [],
            }); // 초기 데이터 설정
          } catch (e) {
            console.error("Error creating document: ", e);
          }
        }
      });

      return () => {
        modeRef.current = null;
        unsubscribe();
      };
    }
  }, [dispatch, roomId, gameMode]);

  return (
    <PageWrap>
      {gameComponents[gameMode]}
      <ChatRoom />
    </PageWrap>
  );
};
export default CommonPage;

const PageWrap = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
`;
