import { useCallback } from "react";
import { CommonButton } from "../common/CommonButton";
import { useSelector } from "react-redux";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const ClearButton = ({ target, text }) => {
  const { roomId } = useSelector(state => state.OmokSlice);

  const ResetHandler = useCallback(
    async target => {
      if (roomId) {
        const docRef = doc(db, "game", `room${roomId}`);
        await updateDoc(docRef, {
          [target]: [],
        });
      }
    },
    [roomId]
  );
  return (
    <CommonButton onClick={() => ResetHandler(target)}>{text}</CommonButton>
  );
};

export default ClearButton;
