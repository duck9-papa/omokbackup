import React, { useRef, useState } from "react";

import styled from "styled-components";
import { CommonButton } from "../common/CommonButton";

import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { getLogin } from "../slices/LoginInfoSlice";

const LoginPage = () => {
  const dispatch = useDispatch();
  const [assign, setAssign] = useState(false);
  const idRef = useRef();
  const pwRef = useRef();
  const nicknameRef = useRef();
  const LoginHandler = async () => {
    const id = idRef.current.value;
    if (id) {
      const docRef = doc(db, "users", id);
      const idDoc = await getDoc(docRef);
      if (idDoc.exists()) {
        const { id, password, nickname } = idDoc.data();
        if (password === pwRef.current.value) {
          dispatch(getLogin({ userId: id, nickname }));
          localStorage.setItem("id", id);
          localStorage.setItem("nickname", nickname);
          toast.success("로그인에 성공하였습니다.");
        } else {
          toast.error("비밀번호가 틀렸습니다.");
        }
      } else {
        toast.error("계정이 존재하지 않습니다");
      }
    } else {
      toast.error("아이디를 입력해주세요");
    }
  };
  const AssignHandler = async () => {
    const id = idRef.current.value;
    const password = pwRef.current.value;
    const nickname = nicknameRef.current.value;

    if (id && password && nickname) {
      const docRef = doc(db, "users", id);
      const idDoc = await getDoc(docRef);
      if (idDoc.exists()) {
        toast.error("이미 존재하는 계정입니다.");
      } else {
        await setDoc(docRef, {
          id,
          password,
          nickname,
        });
        dispatch(getLogin({ userId: id, nickname }));
        localStorage.setItem("id", id);
        localStorage.setItem("nickname", nickname);
        toast.success("가입에 성공하였습니다.");
      }
    }
  };

  return (
    <Wrap>
      <CustomInput ref={idRef} placeholder="id" />
      <CustomInput ref={pwRef} placeholder="password" />
      {assign && <CustomInput ref={nicknameRef} placeholder="nickname" />}
      <div style={{ display: "flex", gap: "20px" }}>
        <CommonButton onClick={assign ? AssignHandler : LoginHandler}>
          {assign ? "가입" : "로그인"}
        </CommonButton>
        <CommonButton onClick={() => setAssign(pre => !pre)}>
          {assign ? "돌아가기" : "회원가입"}
        </CommonButton>
      </div>
    </Wrap>
  );
};

export default LoginPage;

const Wrap = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 20px;
`;

const CustomInput = styled.input`
  width: 200px;
  height: 30px;
  padding: 0 10px;
`;
