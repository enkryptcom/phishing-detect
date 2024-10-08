// src/list-handlers/metamask.ts
import fetch from "node-fetch";

// src/utils/parse-url.ts
import { URL } from "url";
var parse_url_default = (url) => {
  url = url.startsWith("http://") || url.startsWith("https://") ? url : `http://${url}`;
  const urlObj = new URL(url);
  return {
    hostname: urlObj.hostname,
    tld: urlObj.hostname.split(".").pop()
  };
};

// src/list-handlers/metamask.ts
var METAMASK_URL = `https://raw.githubusercontent.com/MetaMask/eth-phishing-detect/master/src/config.json`;
var metamask_default = async () => fetch(METAMASK_URL).then((res) => res.json()).then((_json) => {
  const json = _json;
  const fuzzylist = json.fuzzylist.map((u) => parse_url_default(u).hostname).filter((url) => url.includes("."));
  const whitelist = json.whitelist.map((u) => parse_url_default(u).hostname).filter((url) => url.includes("."));
  const blacklist = json.blacklist.map((u) => parse_url_default(u).hostname).filter((url) => url.includes("."));
  return {
    fuzzylist,
    whitelist,
    blacklist
  };
});

// src/list-handlers/phishfort.ts
import fetch2 from "node-fetch";
var WHITE_LIST_URL = `https://raw.githubusercontent.com/phishfort/phishfort-lists/master/whitelists/domains.json`;
var BLACK_LIST_URL = `https://raw.githubusercontent.com/phishfort/phishfort-lists/master/blacklists/domains.json`;
var phishfort_default = async () => {
  const whitelist = await fetch2(WHITE_LIST_URL).then((res) => res.json()).then(
    (j) => j.map((u) => parse_url_default(u).hostname).filter((url) => url.includes("."))
  );
  const blacklist = await fetch2(BLACK_LIST_URL).then((res) => res.json()).then(
    (j) => j.map((u) => parse_url_default(u).hostname).filter((url) => url.includes("."))
  );
  return {
    fuzzylist: [],
    blacklist,
    whitelist
  };
};

// src/list-handlers/polkadot.ts
import fetch3 from "node-fetch";
var POLKADOT_URL = `https://raw.githubusercontent.com/polkadot-js/phishing/master/all.json`;
var polkadot_default = async () => fetch3(POLKADOT_URL).then((res) => res.json()).then((json) => {
  const blacklist = json.deny.map((u) => parse_url_default(u).hostname).filter((url) => url.includes("."));
  const whitelist = json.allow.map((u) => parse_url_default(u).hostname).filter((url) => url.includes("."));
  return {
    fuzzylist: [],
    whitelist,
    blacklist
  };
});

// src/list-handlers/mew.ts
import fetch4 from "node-fetch";
var MEW_URL = `https://mainnet.mewwallet.dev/web/denylist`;
var mew_default = async () => fetch4(MEW_URL).then((res) => res.json()).then((json) => {
  const blacklist = json.map((u) => parse_url_default(u).hostname).filter((url) => url.includes("."));
  return {
    fuzzylist: [],
    whitelist: [],
    blacklist
  };
});

// src/update-lists.ts
import Protobuf from "protobufjs";
import { writeFileSync } from "fs";
import crc32 from "crc-32";
Promise.all([metamask_default(), polkadot_default(), phishfort_default(), mew_default()]).then(
  (lists) => {
    const allLists = {
      whitelist: [],
      blacklist: [],
      fuzzylist: []
    };
    lists.forEach((list) => {
      allLists.blacklist = allLists.blacklist.concat(list.blacklist);
      allLists.whitelist = allLists.whitelist.concat(list.whitelist);
      allLists.fuzzylist = allLists.fuzzylist.concat(list.fuzzylist);
    });
    allLists.blacklist = Array.from(new Set(allLists.blacklist)).sort();
    allLists.fuzzylist = Array.from(new Set(allLists.fuzzylist)).sort();
    allLists.whitelist = Array.from(new Set(allLists.whitelist)).sort();
    Protobuf.load("src/proto/lists.proto").then((protoroot) => {
      const Lists = protoroot.lookupType("Lists");
      const buf = Lists.encode({
        denylist: allLists.blacklist.map(
          (str) => (crc32.str(str) >>> 0).toString(16)
        ),
        fuzzylist: allLists.fuzzylist.map(
          (str) => (crc32.str(str) >>> 0).toString(16)
        ),
        allowlist: allLists.whitelist.map(
          (str) => (crc32.str(str) >>> 0).toString(16)
        )
      }).finish();
      writeFileSync("./dist/lists/all.pb.bin", buf);
    });
    writeFileSync("./dist/lists/all.json", JSON.stringify(allLists));
    writeFileSync(
      "./dist/lists/whitelist.json",
      JSON.stringify(allLists.whitelist)
    );
    writeFileSync(
      "./dist/lists/blacklist.json",
      JSON.stringify(allLists.blacklist)
    );
    writeFileSync(
      "./dist/lists/fuzzylist.json",
      JSON.stringify(allLists.fuzzylist)
    );
  }
);
