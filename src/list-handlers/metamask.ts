import fetch from "node-fetch";
import URLParser from "../utils/parse-url";

const METAMASK_URL = `https://raw.githubusercontent.com/MetaMask/eth-phishing-detect/master/src/config.json`;

export default async (): Promise<ListDownloader> =>
  fetch(METAMASK_URL)
    .then((res) => res.json())
    .then((_json) => {
      const json = _json as MetamaskList;
      const fuzzylist = json.fuzzylist
        .map((u) => URLParser(u).hostname)
        .filter((url) => url.includes("."));
      const whitelist = json.whitelist
        .map((u) => URLParser(u).hostname)
        .filter((url) => url.includes("."));
      const blacklist = json.blacklist
        .map((u) => URLParser(u).hostname)
        .filter((url) => url.includes("."));
      return {
        fuzzylist,
        whitelist,
        blacklist,
      };
    });
