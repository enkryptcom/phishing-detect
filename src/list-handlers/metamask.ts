import fetch from "node-fetch";
import URLParser from "../utils/parse-url";

const METAMASK_URL = `https://raw.githubusercontent.com/MetaMask/eth-phishing-detect/master/src/config.json`;

export default async (): Promise<ListDownloader> =>
  fetch(METAMASK_URL)
    .then((res) => res.json())
    .then((_json) => {
      const json = _json as MetamaskList;
      const fuzzylist = json.fuzzylist
        .filter((url) => url.includes("."))
        .map((u) => URLParser(u).hostname);
      const whitelist = json.whitelist
        .filter((url) => url.includes("."))
        .map((u) => URLParser(u).hostname);
      const blacklist = json.blacklist
        .filter((url) => url.includes("."))
        .map((u) => URLParser(u).hostname);
      return {
        fuzzylist,
        whitelist,
        blacklist,
      };
    });
