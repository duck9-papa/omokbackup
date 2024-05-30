import React, { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { CommonButton } from "../../common/CommonButton";
import { db } from "../../firebase";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { shuffle } from "lodash";
const DavinciJoinRoom = () => {
  const {
    davinciCode: { davinciCodeUsers },
    roomId,
  } = useSelector(state => state.OmokSlice);
  const { userId, nickname } = useSelector(state => state.LoginInfoSlice);

  const checkIncludes = useMemo(() => {
    return davinciCodeUsers.find(i => i?.userId === userId);
  }, [userId, davinciCodeUsers]);

  const JoinDavinci = useCallback(() => {
    const docRef = doc(db, "game", `room${roomId}`);

    updateDoc(docRef, {
      "davinciCode.davinciCodeUsers": arrayUnion({
        userId,
        nickname,
        cards: [],
        end: false,
        rank: 0,
      }),
    });
    // updateDoc(docRef, {
    //   "davinciCode.davinciCodeUsers": arrayUnion({
    //     userId: "test",
    //     nickname: "test",
    //     cards: [],
    //     end: false,
    //     rank: 0,
    //   }),
    // });
  }, [roomId, userId, nickname]);

  const ExitDavinci = useCallback(() => {
    const docRef = doc(db, "game", `room${roomId}`);

    const remainUsers = davinciCodeUsers.filter(i => i?.userId !== userId);

    updateDoc(docRef, {
      "davinciCode.davinciCodeUsers": remainUsers,
    });
  }, [roomId, davinciCodeUsers, userId]);

  const StartDavinciCode = useCallback(() => {
    const length = davinciCodeUsers.length;
    let updateUsers = [];
    if (length < 2 || length > 4 || !length) {
      toast.error("인원이 적합하지 않습니다.");
    } else {
      for (let i = 0; i < length; i++) {
        const item = davinciCodeUsers[i];
        const keys = Object.keys(item);
        const newItem = {};
        keys.forEach(j => {
          newItem[j] = item[j];
        });
        updateUsers.push(newItem);
      }

      let davinciCards = initialDavinciArr();
      const docRef = doc(db, "game", `room${roomId}`);

      let userCards = [];

      for (let i = 0; i < length; i++) {
        userCards.push([]);
        let cardLength = i === 0 ? 12 / length + 1 : 12 / length;
        userCards[i] = davinciCards.splice(0, cardLength);
        updateUsers[i].cards = userCards[i];
      }

      updateDoc(docRef, {
        "davinciCode.davinciCodeUsers": updateUsers,
        "davinciCode.davinciCodeArr": davinciCards,
        "davinciCode.gameStatus": true,
        "davinciCode.turnUser": davinciCodeUsers[0],
      });
    }
  }, [davinciCodeUsers, roomId]);

  return (
    <JoinRoomContainer>
      {checkIncludes ? (
        <CommonButton
          style={{ backgroundColor: "red" }}
          onClick={() => ExitDavinci()}>
          탈퇴
        </CommonButton>
      ) : (
        <CommonButton onClick={() => JoinDavinci()}> 참여</CommonButton>
      )}
      {davinciCodeUsers.map(i => (
        <JoinName key={i.userId}>{i?.nickname}</JoinName>
      ))}
      <CommonButton onClick={StartDavinciCode}>게임 시작</CommonButton>
    </JoinRoomContainer>
  );
};

const JoinRoomContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: auto;
  align-items: center;
`;

const JoinName = styled.div`
  width: 100px;
  height: 30px;
  border: 1px solid black;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default DavinciJoinRoom;

const initialDavinciArr = () => {
  // joker = -0.5~12.5
  let arr = [
    {
      label: "-",
      color: "B",
      reveal: false,
      order: 0,
      value: Math.floor(Math.random() * 13) + 0.5,
    },
    {
      label: "-",
      color: "W",
      reveal: false,
      order: 0,
      value: Math.floor(Math.random() * 12) - 0.5,
    },
  ];
  for (let i = 0; i < 12; i++) {
    arr.push({ label: i, color: "B", reveal: false, order: 0, value: i });
    arr.push({ label: i, color: "W", reveal: false, order: 0, value: i });
  }
  return shuffle(arr);
};
