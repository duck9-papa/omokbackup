import React, { useCallback, useEffect, useMemo, useRef } from "react";
import styled from "styled-components";
import OmokBoard from "./OmokBoard";
import { useSelector } from "react-redux";
import { doc, arrayRemove, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { CommonButton } from "../common/CommonButton";
import ClearButton from "./ClearButton";

const ButtonRow = styled.div`
  display: flex;
  gap: 20px;
  height: 50px;
`;

const OmokPage = () => {
  const { boardArr, roomId } = useSelector(state => state.OmokSlice);

  const checkLast = useMemo(() => {
    const currentSide = localStorage.getItem("side");
    const lastSide = boardArr[boardArr?.length - 1]?.side;
    return currentSide === lastSide;
  }, [boardArr]);

  const BackHandler = useCallback(async () => {
    const docRef = doc(db, "game", `room${roomId}`);
    const removeValue = boardArr[boardArr.length - 1];
    await updateDoc(docRef, {
      board: arrayRemove(removeValue),
    });
  }, [boardArr, roomId]);

  const ADMIN = localStorage.getItem("ADMIN");

  return (
    <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
      <ButtonRow>
        <ClearButton target={"board"} text={"초기화"} />
        {ADMIN && <ClearButton target={"message"} text={"채팅 삭제"} />}
        {(checkLast || ADMIN) && (
          <CommonButton onClick={BackHandler}>무르기</CommonButton>
        )}
      </ButtonRow>
      <OmokBoard />
    </div>
  );
};

export default OmokPage;
