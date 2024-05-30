import axios from "axios";

const key = process.env.REACT_APP_WORD_KEY;

export const Search = async word => {
  const lists = await axios
    .get("/api/search", {
      params: {
        q: word,
        key,
        req_type: "json",
      },
    })
    .then(r => r.data);
  const channel = lists?.channel;
  return channel;
};
