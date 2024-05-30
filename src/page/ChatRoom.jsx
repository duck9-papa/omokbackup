// react import
import {
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import React, { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { db } from "../firebase";
import { updatemessage, joinRoom } from "../slices/OmokSlice";
import styled from "styled-components";
import { CommonButton } from "../common/CommonButton";
import { Search } from "../Search";
import toast from "react-hot-toast";
import { getAllInitials } from "../hooks/getInnitial";
import ClearButton from "./ClearButton";

const ChatInput = React.forwardRef(({ onKeyUp }, ref) => (
  <RoomInput ref={ref} onKeyUp={onKeyUp} />
));

// message = {text:string,order:number,userId:string,time:object}
const ChatRoom = () => {
  const dispatch = useDispatch();
  const {
    message,
    roomId,
    gameMode,
    wordMatchs,
    epilogueMatchs,
    initialConsonant,
    users,
  } = useSelector(state => state.OmokSlice);
  const { userId, nickname } = useSelector(state => state.LoginInfoSlice);
  const inputRef = useRef();
  useEffect(() => {
    let first = true;
    if (roomId) {
      const docRef = doc(db, "game", `room${roomId}`);
      const unsubscribe = onSnapshot(docRef, async querySnapshot => {
        if (querySnapshot.exists()) {
          const message = querySnapshot.data().message;
          dispatch(updatemessage({ message }));
          if (first) {
            const lastOrder = message[0]?.order + 1 || 1;
            const newMessage = {
              text: `${nickname}님이 입장하였습니다.`,
              order: lastOrder,
              userId,
              nickname,
            };
            updateDoc(docRef, {
              message: arrayUnion(newMessage),
              users: arrayUnion({ userId, nickname }),
            });
            first = false;
          }
        } else {
        }
      });

      return () => unsubscribe();
    }
  }, [dispatch, roomId, userId, nickname]);
  const CliclHandler = useCallback(async () => {
    if (inputRef.current.value) {
      const value = inputRef.current.value;
      inputRef.current.value = "";

      if (!roomId) {
        dispatch(joinRoom({ roomId: value }));
      } else if (value[0] === "/" && gameMode !== "오목") {
        const wordTargets = {
          훈민정음: "wordMatchs",
          끝말잇기: "epilogueMatchs",
        };
        const target = wordTargets[gameMode];
        const currentWords = { epilogueMatchs, wordMatchs };
        const searchWord = value.substring(1);
        const check = currentWords[target]?.find(i => i?.word === searchWord);
        if (gameMode === "훈민정음") {
          if (check) {
            toast.error("중복 단어입니다.");
            return;
          }
          if (getAllInitials(searchWord) !== initialConsonant) {
            toast.error("초성이 틀립니다.");
            return;
          }
        }
        const item = await Search(searchWord).then(r => r.item);
        const filter = item?.filter(
          i => i.word?.replaceAll("-", "") === searchWord
        );
        if (!filter?.length) {
          toast.error("검색 결과가 없습니다.");
        } else {
          const docRef = doc(db, "game", `room${roomId}`);

          const lastOrder =
            currentWords[target][currentWords[target].length - 1]?.order + 1;
          const value = {
            word: searchWord,
            order: lastOrder || 1,
            userId,
            nickname,
          };
          updateDoc(docRef, {
            [target]: arrayUnion(value),
          });
        }
      } else {
        const docRef = doc(db, "game", `room${roomId}`);
        const lastOrder = message[0]?.order + 1;
        const newMessage = {
          order: lastOrder || 1,
          text: value,
          userId,
          nickname,
        };
        updateDoc(docRef, {
          message: arrayUnion(newMessage),
        });
      }
    }
  }, [
    dispatch,
    roomId,
    message,
    gameMode,
    epilogueMatchs,
    wordMatchs,
    initialConsonant,
    userId,
    nickname,
  ]);

  const ModeHandler = () => {
    if (roomId) {
      const gameArr = ["오목", "훈민정음", "끝말잇기", "다빈치코드"];
      const docRef = doc(db, "game", `room${roomId}`);
      let nextGameMode =
        gameArr[gameArr.findIndex(i => gameMode === i) + 1] || "오목";
      updateDoc(docRef, {
        gameMode: nextGameMode,
      });
    }
  };
  const ADMIN = localStorage.getItem("ADMIN");
  return (
    <Wrap>
      <ChatContainer>
        {roomId && <RoomTag>{roomId}</RoomTag>}
        {roomId && (
          <GameModeButton onClick={ModeHandler}>{gameMode}</GameModeButton>
        )}
        <MessageContainer>
          {message.map((item, index) => (
            <MessageBox
              $self={userId === item.userId}
              key={`${index}messageKey`}>
              <TextSpan> {item?.text}</TextSpan>
              <NicknameSpan>{item.nickname}</NicknameSpan>
            </MessageBox>
          ))}
        </MessageContainer>
      </ChatContainer>
      <BottonRow>
        <ChatInput
          ref={inputRef}
          onKeyUp={e => {
            if (e.code === "Enter") {
              e.stopPropagation();
              CliclHandler();
            }
          }}
        />
        <CommonButton onClick={CliclHandler}>
          {!roomId ? "입장" : "전송"}
        </CommonButton>
      </BottonRow>
      {users.length ? (
        <RoomMembers>
          {users.map(i => (
            <span key={i.userId}>{i?.nickname}</span>
          ))}
        </RoomMembers>
      ) : null}
    </Wrap>
  );
};
export default ChatRoom;

const Wrap = styled.div`
  width: 500px;
  height: 950px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
`;
const ChatContainer = styled.div`
  width: 100%;
  height: 880px;
  border: 1px solid black;
  border-radius: 16px;
  position: relative;
  padding: 10px;
  gap: 20px;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const RoomTag = styled.div`
  width: 100px;
  height: 50px;
  border: 1px solid black;
  border-radius: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  background-color: #d9d9d9;
  left: 10px;
  top: 10px;
  z-index: 1;
`;

const RoomInput = styled.input`
  width: calc(100% - 110px);
  height: 50px;
  border-radius: 16px;
  border-radius: 1px solid black;
  font-weight: 500;
  padding: 0 5px;
`;

const BottonRow = styled.div`
  display: flex;
  gap: 10px;
`;

const MessageBox = styled.div`
  max-width: 100%;
  display: flex;
  position: relative;
  align-items: center;
  flex-direction: ${p => (p.$self ? "row-reverse" : "row")};
  gap: 10px;
`;
const NicknameSpan = styled.span`
  font-weight: 600;
`;

const MessageContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column-reverse;
  gap: 15px;
  overflow-y: auto;
  box-sizing: border-box;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const GameModeButton = styled(CommonButton)`
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 1;
`;

const RoomMembers = styled.div`
  width: 100px;
  position: absolute;
  left: calc(100% + 30px);
  border: 1px solid black;
  align-items: center;
  top: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TextSpan = styled.span`
  width: 60%;
  display: flex;
  padding: 10px;
  border-radius: 16px;
  border: 1px solid black;
  background-color: white;
  box-sizing: border-box;
  word-wrap: break-word;
  white-space: pre-wrap;
`;
