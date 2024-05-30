import React, { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";

import DavinciJoinRoom from "./DavinciJoinRoom";
import DavinciGameBoard from "./DavinciGameBoard";

const DavinciCodePage = () => {
  const {
    davinciCode: { gameStatus },
  } = useSelector(state => state.OmokSlice);

  return <Wrap>{gameStatus ? <DavinciGameBoard /> : <DavinciJoinRoom />}</Wrap>;
};

export default DavinciCodePage;

const Wrap = styled.div`
  width: 1000px;
  height: 1000px;
  padding: 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  border: 1px solid black;
`;
