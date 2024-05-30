// react import
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { CommonButton } from "../../common/CommonButton";
import { db } from "../../firebase";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { commonAction } from "../../slices/OmokSlice";

// step = 0 최초의 턴, 무조건 선택 후에 제출을 해야 함 성공시 해당 카드 밝혀짐
// step = 1 선택 성공, 턴 종료 버튼 생성, 턴을 종료하거나 추가 제출이 가능함.
// step = 2 선택 실패, 본인의 카드를 선택하면 밝혀지면서 턴이 넘어감
// end 판별 순간에 남은 사람이 1명일 경우 step을 3으로
// step = 3 게임 종료
const DavinciGameBoard = () => {
  const {
    davinciCode: {
      davinciCodeUsers,
      selectCard,
      turnUser,
      davinciCodeArr,
      turnStep,
    },
    roomId,
    submitValue,
    message,
  } = useSelector(state => state.OmokSlice);
  const dispatch = useDispatch();
  const noticeObject = {
    0: "카드를 선택 후 맞춰보세요!",
    1: "카드를 추가로 맞추거나, 턴을 넘기세요!",
    2: "공개할 카드를 선택하세요!",
    3: "게임이 종료되었습니다!",
  };

  const { userId, nickname } = useSelector(state => state.LoginInfoSlice);

  const ResetGame = () => {
    const docRef = doc(db, "game", `room${roomId}`);
    updateDoc(docRef, {
      davinciCode: {
        davinciCodeArr: [],
        davinciCodeGameStatus: false,
        davinciCodeUsers: [],
        gameStatus: false,
        turnUser: {},
        selectCard: {},
        turnStep: 0,
      },
    });
  };

  const NextTurn = useCallback(
    updateUsers => {
      const docRef = doc(db, "game", `room${roomId}`);
      if (davinciCodeArr.length) {
        const users = updateUsers || davinciCodeUsers;

        let newUsers = [];
        const nextCard = { ...davinciCodeArr[0] };
        let currentIndex = users.findIndex(i => i.userId === turnUser.userId);
        let nextIndex = currentIndex === users.length ? 0 : currentIndex + 1;

        while (users[nextIndex] && users[nextIndex].end) {
          nextIndex += 1;
        }
        if (nextIndex === users.length) {
          nextIndex = 0;
        }
        const nextUser = users[nextIndex];
        const keys = Object.keys(nextUser);

        const newUser = {};
        const nextOrder = Math.max(...nextUser?.cards.map(j => j.order)) + 1;

        const newCard = { ...nextCard };
        newCard.order = nextOrder;
        keys.forEach(i => {
          newUser[i] = i === "cards" ? [...nextUser[i], newCard] : nextUser[i];
        });

        users.forEach(i => {
          newUsers.push(i.userId === nextUser.userId ? newUser : i);
        });

        updateDoc(docRef, {
          "davinciCode.turnUser": newUser,
          "davinciCode.davinciCodeArr": arrayRemove(nextCard),
          "davinciCode.turnStep": 0,
          "davinciCode.davinciCodeUsers": newUsers,
        });
      }
    },
    [davinciCodeUsers, roomId, davinciCodeArr, turnUser]
  );
  // 제출과 셀프 오픈에 end 판별 로직 추가

  const SubmitCard = useCallback(() => {
    const checkValues =
      (submitValue >= 0 || submitValue) &&
      (selectCard.label >= 0 || selectCard.label);
    if (checkValues) {
      const docRef = doc(db, "game", `room${roomId}`);
      let updateUsers = [];
      const checkSubmit = selectCard.label === submitValue;
      const lastOrder = message[0]?.order + 1;

      if (checkSubmit) {
        for (let i = 0; i < davinciCodeUsers.length; i++) {
          const item = davinciCodeUsers[i];
          let findIndex = item.cards.findIndex(
            j => j.label === submitValue && selectCard.color === j.color
          );
          const cards = item.cards;
          let newCards = [];
          cards.forEach(j => {
            newCards.push({ ...j });
          });
          const newItem = { ...item };
          newItem.cards = newCards;

          if (findIndex >= 0) {
            newItem.cards[findIndex].reveal = true;
            if (newItem.cards.every(j => j.reveal)) {
              newItem.end = true;
            }
          }
          updateUsers.push(newItem);
        }
        const newMessage = {
          order: lastOrder || 1,
          text: `${nickname}님이 ${submitValue}예측! => 성공`,
          userId,
          nickname,
        };

        updateDoc(docRef, {
          "davinciCode.turnStep": 1,
          "davinciCode.selectCard": {},
          "davinciCode.davinciCodeUsers": updateUsers,
          message: arrayUnion(newMessage),
        });

        if (updateUsers.filter(j => j.end).length === updateUsers.length - 1) {
          updateDoc(docRef, {
            "davinciCode.turnStep": 3,
          });
        }
      } else {
        const newMessage = {
          order: lastOrder || 1,
          text: `${nickname}님이 ${submitValue}예측! => 실패`,
          userId,
          nickname,
        };

        updateDoc(docRef, {
          "davinciCode.turnStep": 2,
          "davinciCode.selectCard": {},
          message: arrayUnion(newMessage),
        });
      }
    } else {
      toast.error("값을 선택해주세요!");
    }
  }, [
    selectCard,
    submitValue,
    roomId,
    message,
    nickname,
    userId,
    davinciCodeUsers,
  ]);
  return (
    <Wrap>
      <ResetButton onClick={ResetGame}>초기화</ResetButton>
      <NoticeSpan>{noticeObject[turnStep]}</NoticeSpan>
      {davinciCodeUsers.map((item, index) => {
        const checkTurn = turnUser.userId === item.userId;
        const cards = [...item?.cards].sort((a, b) => {
          if (a.value !== b.value) {
            return a.value - b.value;
          } else {
            if (a.color === "B" && b.color === "W") {
              return -1;
            } else if (a.color === "W" && b.color === "B") {
              return 1;
            }
          }
        });
        const checkEnd = item.end;

        return (
          <UserRow
            $checkEnd={checkEnd}
            $checkTurn={checkTurn}
            key={`${index}userKeys`}>
            <TopRow>{item.nickname}</TopRow>
            {checkTurn && turnUser.userId === userId && turnStep === 1 && (
              <NextButton onClick={() => NextTurn()}>턴 넘기기</NextButton>
            )}
            <CardRows>
              {cards?.map((card, index) => {
                const checkReveal = card.reveal || item.userId === userId;
                const checkSelect =
                  selectCard.value === card.value &&
                  selectCard.color === card.color;
                const ClickCard = async () => {
                  // step이 2이고 내 차례일때 발동 x

                  // step이 2고 카드가 나의 카드이고, 현재 유저가 나일경우에 reveal 오픈
                  const docRef = doc(db, "game", `room${roomId}`);
                  // 셀프 오픈
                  if (turnStep === 2 && checkTurn && item.userId === userId) {
                    if (!card.reveal) {
                      let updateUsers = davinciCodeUsers.map(i => {
                        let newCards = [...i.cards].map(j => ({ ...j }));
                        const returnValue = { ...i };
                        let findIndex = newCards.findIndex(j => {
                          return (
                            j.label === card.label && j.color === card.color
                          );
                        });
                        if (findIndex >= 0) {
                          newCards[findIndex].reveal = true;
                          if (newCards.every(j => j.reveal)) {
                            returnValue.end = true;
                          }
                        }

                        returnValue.cards = newCards;

                        return returnValue;
                      });

                      await updateDoc(docRef, {
                        "davinciCode.davinciCodeUsers": updateUsers,
                      });

                      if (
                        updateUsers.filter(j => j.end).length ===
                        updateUsers.length - 1
                      ) {
                        await updateDoc(docRef, {
                          "davinciCode.turnStep": 3,
                        });
                      } else {
                        NextTurn(updateUsers);
                      }
                    } else {
                      toast.error("이미 밝혀진 카드입니다.");
                    }
                  } else {
                    if (
                      !checkReveal &&
                      card.userId !== userId &&
                      turnUser.userId === userId
                    ) {
                      updateDoc(docRef, {
                        "davinciCode.selectCard": checkSelect ? {} : card,
                      });
                    }
                  }
                };

                return (
                  <DavinciCard
                    key={`${index}`}
                    $color={card.color}
                    $turnStep={turnStep}
                    $checkTurn={checkTurn}
                    $checkMy={item.userId === userId}
                    $checkReveal={checkReveal}
                    $checkSelect={checkSelect}
                    $checkOpen={card.reveal}
                    onClick={ClickCard}>
                    {checkReveal || turnStep === 3 ? card.label : "?"}
                    {(checkReveal && card.label === "-") ||
                    (item.userId === userId && card.label === "-") ? (
                      <JokerValueSpan>{card.value}</JokerValueSpan>
                    ) : null}
                    <CardOrderSpan>{card.order || ""}</CardOrderSpan>
                  </DavinciCard>
                );
              })}
            </CardRows>
          </UserRow>
        );
      })}
      <SubmitArea>
        {turnUser.userId === userId && turnStep !== 2 && turnStep !== 3 && (
          <>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, "-"].map(i => (
              <CommonButton
                key={`${i}submitKey`}
                style={{ border: submitValue === i && "2px solid red" }}
                onClick={() =>
                  dispatch(
                    commonAction({
                      target: "submitValue",
                      value: submitValue === i ? null : i,
                    })
                  )
                }>
                {i}
              </CommonButton>
            ))}
            <CommonButton style={{ marginTop: "auto" }} onClick={SubmitCard}>
              제출
            </CommonButton>
          </>
        )}
      </SubmitArea>
    </Wrap>
  );
};

export default DavinciGameBoard;

const Wrap = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
`;
const NoticeSpan = styled.div`
  width: 100%;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 600;
  top: 0;
  translate: 0 calc(-100% - 20px);
`;
const SubmitArea = styled.div`
  display: flex;
  position: absolute;
  flex-direction: column;
  gap: 10px;
  width: 150px;
  height: 100%;
  padding: 10px;
  left: 0;
  translate: calc(-100% + -20px) 0;
  border: 1px solid black;
`;

const UserRow = styled.div`
  width: 100%;
  height: 25%;
  border: 1px solid black;
  background-color: ${({ $checkTurn, $checkEnd }) =>
    $checkEnd ? "#d9d9d9" : $checkTurn && "#E8DDC2"};
  display: flex;
  padding: 15px;
  position: relative;
  flex-direction: column;
  justify-content: space-between;
`;
const TopRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const CardRows = styled.div`
  width: 100%;
  display: flex;
  gap: 10px;
`;

const JokerValueSpan = styled.div`
  position: absolute;
  right: 5px;
  top: 5px;
  font-size: 12px;
`;

const CardOrderSpan = styled.div`
  position: absolute;
  left: 5px;
  top: 5px;
  font-size: 12px;
`;

const NextButton = styled(CommonButton)`
  position: absolute;
  right: 10px;
  top: 10px;
`;

const DavinciCard = styled.div`
  width: 60px;
  height: 120px;
  font-size: 20px;
  display: flex;
  padding: 10px;
  justify-content: center;
  align-items: center;
  position: relative;
  ${({ $checkSelect }) =>
    $checkSelect ? "border:3px solid yellow;" : "  border: 1px solid black;"}
  // test기준 step =2 checkTurn = false
  ${({ $checkTurn, $turnStep, $checkReveal, $checkMy }) => {
    if ($turnStep === 2 && $checkTurn && $checkMy) {
      return "cursor:pointer;";
    } else if ($turnStep === 2 && $checkMy) {
      return null;
    } else if (!$checkReveal) {
      return "cursor:pointer;";
    }
  }}
  ${({ $color }) =>
    $color === "B"
      ? "color:#fff;background-color:#222"
      : "color:#222;background-color:#fff;"};

  ${({ $checkOpen }) => $checkOpen && "border:2px solid red"};
`;

const ResetButton = styled(CommonButton)`
  position: absolute;
  left: 0;
  top: 0;
  translate: calc(-100% - 20px) calc(-100% - 20px);
`;

// step이 2이고 카드가 나의 카드고, 접속한 유저가 현재 턴인 유저일 경우 pointer
// step이 2이고 카드가 나의 카드가 아닐경우 no Pointer
