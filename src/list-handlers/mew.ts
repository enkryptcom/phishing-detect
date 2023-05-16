import fetch from "node-fetch";
import URLParser from "../utils/parse-url";

const MEW_URL = `https://mainnet.mewwallet.dev/web/denylist`;

export default async (): Promise<ListDownloader> =>
  fetch(MEW_URL)
    .then((res) => res.json())
    .then((json: string[]) => {
      const blacklist = json
        .map((u) => URLParser(u).hostname)
        .filter((url) => url.includes("."));
      return {
        fuzzylist: [],
        whitelist: [],
        blacklist,
      };
    });
