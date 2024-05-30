import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import configStore from "./slices/configStore";

import { arrayUnion, doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

window.onerror = async (message, source, lineno, colno, error) => {
  const docRef = doc(db, "log", `error`);
  const date = new Date();

  const errorLog = { message, source, date };

  await updateDoc(docRef, {
    logs: arrayUnion(errorLog),
  });
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={configStore}>
    <BrowserRouter>
      <Toaster
        toastOptions={{
          duration: 1000,
        }}
      />
      <App />
    </BrowserRouter>
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
