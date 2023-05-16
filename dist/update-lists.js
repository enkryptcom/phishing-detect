var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/list-handlers/metamask.ts
var import_node_fetch = __toESM(require("node-fetch"));

// src/utils/parse-url.ts
var import_url = require("url");
var parse_url_default = (url) => {
  url = url.startsWith("http://") || url.startsWith("https://") ? url : `http://${url}`;
  const urlObj = new import_url.URL(url);
  return {
    hostname: urlObj.hostname,
    tld: urlObj.hostname.split(".").pop()
  };
};

// src/list-handlers/metamask.ts
var METAMASK_URL = `https://raw.githubusercontent.com/MetaMask/eth-phishing-detect/master/src/config.json`;
var metamask_default = async () => (0, import_node_fetch.default)(METAMASK_URL).then((res) => res.json()).then((_json) => {
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
var import_node_fetch2 = __toESM(require("node-fetch"));
var WHITE_LIST_URL = `https://raw.githubusercontent.com/phishfort/phishfort-lists/master/whitelists/domains.json`;
var BLACK_LIST_URL = `https://raw.githubusercontent.com/phishfort/phishfort-lists/master/blacklists/domains.json`;
var phishfort_default = async () => {
  const whitelist = await (0, import_node_fetch2.default)(WHITE_LIST_URL).then((res) => res.json()).then(
    (j) => j.map((u) => parse_url_default(u).hostname).filter((url) => url.includes("."))
  );
  const blacklist = await (0, import_node_fetch2.default)(BLACK_LIST_URL).then((res) => res.json()).then(
    (j) => j.map((u) => parse_url_default(u).hostname).filter((url) => url.includes("."))
  );
  return {
    fuzzylist: [],
    blacklist,
    whitelist
  };
};

// src/list-handlers/polkadot.ts
var import_node_fetch3 = __toESM(require("node-fetch"));
var POLKADOT_URL = `https://raw.githubusercontent.com/polkadot-js/phishing/master/all.json`;
var polkadot_default = async () => (0, import_node_fetch3.default)(POLKADOT_URL).then((res) => res.json()).then((json) => {
  const blacklist = json.deny.map((u) => parse_url_default(u).hostname).filter((url) => url.includes("."));
  const whitelist = json.allow.map((u) => parse_url_default(u).hostname).filter((url) => url.includes("."));
  return {
    fuzzylist: [],
    whitelist,
    blacklist
  };
});

// src/list-handlers/mew.ts
var import_node_fetch4 = __toESM(require("node-fetch"));
var MEW_URL = `https://mainnet.mewwallet.dev/web/denylist`;
var mew_default = async () => (0, import_node_fetch4.default)(MEW_URL).then((res) => res.json()).then((json) => {
  const blacklist = json.map((u) => parse_url_default(u).hostname).filter((url) => url.includes("."));
  return {
    fuzzylist: [],
    whitelist: [],
    blacklist
  };
});

// src/update-lists.ts
var import_protobufjs = __toESM(require("protobufjs"));
var import_fs = require("fs");
var import_crc_32 = __toESM(require("crc-32"));
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
    import_protobufjs.default.load("src/proto/lists.proto").then((protoroot) => {
      const Lists = protoroot.lookupType("Lists");
      const buf = Lists.encode({
        denylist: allLists.blacklist.map(
          (str) => (import_crc_32.default.str(str) >>> 0).toString(16)
        ),
        fuzzylist: allLists.fuzzylist.map(
          (str) => (import_crc_32.default.str(str) >>> 0).toString(16)
        ),
        allowlist: allLists.whitelist.map(
          (str) => (import_crc_32.default.str(str) >>> 0).toString(16)
        )
      }).finish();
      (0, import_fs.writeFileSync)("./dist/lists/all.pb.bin", buf);
    });
    (0, import_fs.writeFileSync)("./dist/lists/all.json", JSON.stringify(allLists));
    (0, import_fs.writeFileSync)(
      "./dist/lists/whitelist.json",
      JSON.stringify(allLists.whitelist)
    );
    (0, import_fs.writeFileSync)(
      "./dist/lists/blacklist.json",
      JSON.stringify(allLists.blacklist)
    );
    (0, import_fs.writeFileSync)(
      "./dist/lists/fuzzylist.json",
      JSON.stringify(allLists.fuzzylist)
    );
  }
);
