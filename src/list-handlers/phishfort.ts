import fetch from "node-fetch";
import URLParser from "../utils/parse-url";

const WHITE_LIST_URL = `https://raw.githubusercontent.com/phishfort/phishfort-lists/master/whitelists/domains.json`;
const BLACK_LIST_URL = `https://raw.githubusercontent.com/phishfort/phishfort-lists/master/blacklists/domains.json`;

export default async (): Promise<ListDownloader> => {
  const whitelist: string[] = await fetch(WHITE_LIST_URL)
    .then((res) => res.json())
    .then((j) =>
      j.map((u) => URLParser(u).hostname).filter((url) => url.includes("."))
    );
  const blacklist: string[] = await fetch(BLACK_LIST_URL)
    .then((res) => res.json())
    .then((j) =>
      j.map((u) => URLParser(u).hostname).filter((url) => url.includes("."))
    );
  return {
    fuzzylist: [],
    blacklist,
    whitelist,
  };
};
