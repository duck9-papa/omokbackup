import React, { useCallback, useMemo } from "react";
import styled from "styled-components";
import { CommonButton } from "../common/CommonButton";
import ClearButton from "./ClearButton";
import { useDispatch, useSelector } from "react-redux";
import { commonAction } from "../slices/OmokSlice";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

function getRandomConsonants() {
  const consonants = [
    "ㄱ",
    "ㄴ",
    "ㄷ",
    "ㄹ",
    "ㅁ",
    "ㅂ",
    "ㅅ",
    "ㅇ",
    "ㅈ",
    "ㅊ",
    "ㅋ",
    "ㅌ",
    "ㅍ",
    "ㅎ",
  ];

  const randomIndex1 = Math.floor(Math.random() * consonants.length);
  const randomIndex2 = Math.floor(Math.random() * consonants.length);

  // 선택된 자음 반환
  return [consonants[randomIndex1], consonants[randomIndex2]];
}

const wordTargets = {
  훈민정음: "wordMatchs",
  끝말잇기: "epilogueMatchs",
};

const WordGamePage = () => {
  const ADMIN = localStorage.getItem("ADMIN");
  const dispatch = useDispatch();
  const {
    wordMatchs,
    epilogueMatchs,
    gameMode,
    searchResults,
    searchWord,
    initialConsonant,
    roomId,
  } = useSelector(state => state.OmokSlice);

  const listArr = useMemo(
    () => (gameMode === "훈민정음" ? wordMatchs : epilogueMatchs),
    [gameMode, wordMatchs, epilogueMatchs]
  );

  const InitialHandler = () => {
    const docRef = doc(db, "game", `room${roomId}`);

    updateDoc(docRef, {
      initialConsonant: getRandomConsonants().join(""),
    });
  };

  const DeleteLastWord = useCallback(() => {
    const docRef = doc(db, "game", `room${roomId}`);
    const target = wordTargets[gameMode];
    let removeArr = [...listArr];
    if (removeArr[0]) {
      removeArr.pop();
    }
    updateDoc(docRef, {
      [target]: removeArr,
    });
  }, [roomId, listArr, gameMode]);
  return (
    <Wrap>
      <ButtonRow>
        <CommonButton onClick={DeleteLastWord}>마지막 삭제</CommonButton>
        {gameMode === "훈민정음" && (
          <CommonButton onClick={InitialHandler}>자음 추출</CommonButton>
        )}
        <ClearButton target={wordTargets[gameMode]} text={"초기화"} />
        {ADMIN && <ClearButton target={"message"} text={"채팅 삭제"} />}
      </ButtonRow>
      <GameArea>
        <DescriptionArea>
          <TopSpan>{searchWord}</TopSpan>
          {gameMode === "훈민정음" && (
            <InitialSapn>{initialConsonant}</InitialSapn>
          )}
          {searchResults?.map((item, index) => (
            <DefinitionItem key={`${index}definitionKey`}>
              <OriginItem>
                <span>{item.origin}</span> <span>{item.pos}</span>
                <span>{item.cat}</span>
              </OriginItem>
              <span>{item.definition}</span>
            </DefinitionItem>
          ))}
        </DescriptionArea>
        <WordArea>
          <WordItemContainer>
            {[...listArr].reverse().map((item, index) => {
              const handler = () => {
                dispatch(
                  commonAction({ target: "searchWord", value: item?.word })
                );
              };
              return (
                <WordItem
                  $current={index === 0}
                  onClick={handler}
                  key={`${index}wordItemKeys`}>
                  <WordText>{item?.word}</WordText>
                  {item?.nickname}
                </WordItem>
              );
            })}
          </WordItemContainer>
        </WordArea>
      </GameArea>
    </Wrap>
  );
};

export default WordGamePage;

const Wrap = styled.div`
  width: 950px;
  height: 950px;
  gap: 10px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
`;

const GameArea = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  box-sizing: border-box;
`;

const DescriptionArea = styled.div`
  width: 60%;
  height: 900px;
  border: 1px solid black;
  border-radius: 16px;
  box-sizing: border-box;
  padding: 50px 10px 10px;
  display: flex;
  flex-direction: column;
  position: relative;
  gap: 20px;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;
const WordArea = styled.div`
  padding: 10px;
  width: 35%;
  height: 900px;
  border: 1px solid black;
  border-radius: 16px;
  box-sizing: border-box;
  display: flex;
  gap: 10px;
  flex-direction: column;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const WordItemContainer = styled.div`
  display: flex;
  width: 100%;
  overflow-y: auto;
  flex-direction: column-reverse;
  gap: 10px;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const WordItem = styled.div`
  display: flex;
  justify-content: end;

  align-items: center;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid black;
  cursor: pointer;
  background-color: ${({ $current }) => ($current ? "pink" : "#fff8dc")};
  position: relative;
  &:hover {
    opacity: 0.8;
  }
`;

const DefinitionItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-weight: 600;
`;
const OriginItem = styled.div`
  display: flex;
  gap: 5px;
`;

const TopSpan = styled.span`
  position: absolute;
  left: 10px;
  top: 15px;
  font-weight: 600;
`;

const InitialSapn = styled.span`
  position: absolute;
  right: 10px;
  top: 15px;
  font-weight: 600;
  padding: 5px;
  border: 1px solid black;
  border-radius: 6px;
  box-sizing: border-box;
`;

const WordText = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  translate: -50% -50%;
  font-weight: 600;
`;
