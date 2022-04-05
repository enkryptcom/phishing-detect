import fetch from "node-fetch";
import URLParser from "../utils/parse-url";

const WHITE_LIST_URL = `https://api.cryptoscamdb.org/v1/whitelist`;
const BLACK_LIST_URL = `https://api.cryptoscamdb.org/v1/blacklist`;

export default async (): Promise<ListDownloader> => {
  const whitelist: string[] = await fetch(WHITE_LIST_URL)
    .then((res) => res.json())
    .then((j) => j.result.map((u) => URLParser(u).hostname));
  const blacklist: string[] = await fetch(BLACK_LIST_URL)
    .then((res) => res.json())
    .then((j) => j.result.map((u) => URLParser(u).hostname));
  return {
    fuzzylist: [],
    blacklist,
    whitelist,
  };
};
