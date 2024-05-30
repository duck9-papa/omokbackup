import React, { useMemo } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { BoardResetThunk, BoardSetThunk } from "../slices/OmokSlice";
import { CommonButton } from "../common/CommonButton";
// import inho from "../images/강인호.png";
// import tahoon from "../images/강태훈.png";
// import pine from "../images/파인.jpg";
// import yong from "../images/용과.jpg";
// import background1 from "../images/협곡.webp";
// import background2 from "../images/협곡2.webp";
// import background3 from "../images/용안황궁.jpg";

const BoardWrap = styled.div`
  width: 950px;
  height: 950px;
  display: flex;
  flex-wrap: wrap;
  position: relative;
`;
const BaseImg = styled.img`
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  z-index: -1;
`;

const BoardCell = styled.div`
  width: 50px;
  height: 50px;
  border: 0.5px solid black;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  background-color: ${p => (p.$last ? "#fff8dc" : "#deb887")};
  &:hover {
    opacity: 0.8;
    cursor: pointer;
  }
`;

const BoardStone = styled.div`
  width: 80%;
  height: 80%;
  border-radius: 50%;
  border: 1px solid black;
  background-color: ${p => (p.$side === "B" ? "black" : "white")};
`;

const ImgStone = styled.img`
  width: 80%;
  height: 80%;
  border-radius: 50%;
  border: 1px solid black;
`;

const stoneObj = {
  // B: <ImgStone src={inho} $side={"B"} />,
  // W: <ImgStone src={tahoon} $side={"W"} />,
  B: <BoardStone $side={"B"} />,
  W: <BoardStone $side={"W"} />,
};

const WinCover = styled.div`
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  position: absolute;
  color: white;
  gap: 20px;
`;

const OmokBoard = () => {
  const { board, boardArr, keys, roomId } = useSelector(
    state => state.OmokSlice
  );

  const win = useMemo(() => {
    const checkCells = {};

    const filter = keys.filter(i => board[i]);

    filter.forEach(i => {
      checkCells[i] = {
        R: false,
        B: false,
        RB: false,
        RT: false,
      };
    });

    for (let i = 0; i < filter.length; i++) {
      const cell = board[filter[i]];
      let RArr = [cell.location];
      let BArr = [cell.location];
      let RBArr = [cell.location];
      let RTArr = [cell.location];
      if (cell) {
        // 가로
        const side = cell?.side;
        let count = 1;
        let [cellRow, cellColumn] = cell.location.split("x");
        let row = Number(cellRow);
        let column = Number(cellColumn) + 1;
        if (!checkCells[cell?.location].R) {
          while (board[`${row}x${Number(column)}`]) {
            const rightCell = board[`${row}x${Number(column)}`];
            if (rightCell?.side === side) {
              RArr.push(`${row}x${Number(column)}`);
              count += 1;
              column += 1;
            } else {
              break;
            }
          }
          if (count > 5) {
            RArr.forEach(j => {
              checkCells[j].R = true;
            });
          }
          if (count === 5) {
            return side;
          }
        }
        // 세로
        if (!checkCells[cell?.location].B) {
          row = Number(cellRow) + 1;
          column = Number(cellColumn);
          count = 1;
          while (board[`${row}x${Number(column)}`]) {
            const rightCell = board[`${Number(row)}x${Number(column)}`];
            if (rightCell?.side === side) {
              BArr.push(`${row}x${Number(column)}`);
              count += 1;
              row += 1;
            } else {
              break;
            }
          }
          if (count > 5) {
            BArr.forEach(j => {
              checkCells[j].B = true;
            });
          }
          if (count === 5) {
            return side;
          }
        }

        // 우하향 대각선
        if (!checkCells[cell?.location].RB) {
          row = Number(cellRow) + 1;
          column = Number(cellColumn) + 1;
          count = 1;
          while (board[`${row}x${Number(column)}`]) {
            const rightCell = board[`${Number(row)}x${Number(column)}`];
            if (rightCell?.side === side) {
              RBArr.push(`${row}x${Number(column)}`);
              count += 1;
              row += 1;
              column += 1;
            } else {
              break;
            }
          }
          if (count > 5) {
            RBArr.forEach(j => {
              checkCells[j].RB = true;
            });
          }
          if (count === 5) {
            return side;
          }
        }
        // 좌하향 대각선
        if (!checkCells[cell?.location].RT) {
          row = Number(cellRow) + 1;
          column = Number(cellColumn) - 1;
          count = 1;
          while (board[`${row}x${Number(column)}`]) {
            const rightCell = board[`${Number(row)}x${Number(column)}`];
            if (rightCell?.side === side) {
              RTArr.push(`${row}x${Number(column)}`);
              count += 1;
              row += 1;
              column -= 1;
            } else {
              break;
            }
          }
          if (count > 5) {
            RTArr.forEach(j => {
              checkCells[j].RT = true;
            });
          }
          if (count === 5) {
            return side;
          }
        }
      }
    }
  }, [board, keys]);

  const dispatch = useDispatch();
  const cells = useMemo(() => {
    let arr = [];
    for (let i = 1; i <= 19 * 19; i++) {
      const row = Math.ceil(i / 19);
      const column = i % 19 || 19;
      const location = `${row}x${column}`;
      const cell = board[location];
      const side = cell?.side;
      const stone = stoneObj[side];
      const lastStone = boardArr[boardArr.length - 1];
      const handler = () => {
        if (roomId) {
          const currentSide = localStorage.getItem("side");
          const checkAdmin = localStorage.getItem("ADMIN");

          if (!cell) {
            const stoneSide = lastStone?.side === "B" ? "W" : "B";
            if (checkAdmin || !currentSide || stoneSide === currentSide) {
              if (!currentSide) {
                localStorage.setItem("side", stoneSide);
              }
              dispatch(
                BoardSetThunk({
                  stone: {
                    location,
                    side: stoneSide,
                    order: (lastStone?.order || 0) + 1,
                  },
                })
              );
            } else {
              toast.error("차례가 아닙니다.");
            }
          } else {
            toast.error("놓을 수 없습니다.");
          }
        } else {
          toast.error("게임 방에 입장해주세요.");
        }
      };

      arr.push(
        <BoardCell
          $last={location === lastStone?.location}
          onClick={handler}
          key={i}>
          {stone}
        </BoardCell>
      );
    }
    return arr;
  }, [dispatch, board, boardArr, roomId]);
  return (
    <BoardWrap>
      {/* <BaseImg src={background3} /> */}
      {win && (
        <WinCover>
          <span>{`승자: ${win === "B" ? "흑돌" : "백돌"}`}</span>
          <CommonButton onClick={() => dispatch(BoardResetThunk())}>
            초기화
          </CommonButton>
        </WinCover>
      )}
      {cells}
    </BoardWrap>
  );
};

export default OmokBoard;
