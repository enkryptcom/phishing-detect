import fetch from "node-fetch";
import URLParser from "../utils/parse-url";

const POLKADOT_URL = `https://raw.githubusercontent.com/polkadot-js/phishing/master/all.json`;

export default async (): Promise<ListDownloader> =>
  fetch(POLKADOT_URL)
    .then((res) => res.json())
    .then((json: PolkadotList) => {
      const blacklist = json.deny.map((u) => URLParser(u).hostname);
      const whitelist = json.allow.map((u) => URLParser(u).hostname);
      return {
        fuzzylist: [],
        whitelist,
        blacklist,
      };
    });
