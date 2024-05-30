import styled from "styled-components";

export const CommonButton = styled.div`
  width: 100px;
  height: 50px;
  border-radius: 10px;
  border: 1px solid black;
  background-color: blue;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  &:hover {
    opacity: 0.8;
    cursor: pointer;
  }
`;
