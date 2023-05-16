import { metamask, polkadot, phishfort, mew } from "@src/list-handlers";
import Protobuf from "protobufjs";
import { writeFileSync } from "fs";
import crc32 from "crc-32";

Promise.all([metamask(), polkadot(), phishfort(), mew()]).then(
  (lists: ListDownloader[]) => {
    const allLists: ListDownloader = {
      whitelist: [],
      blacklist: [],
      fuzzylist: [],
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
        denylist: allLists.blacklist.map((str) =>
          (crc32.str(str) >>> 0).toString(16)
        ),
        fuzzylist: allLists.fuzzylist.map((str) =>
          (crc32.str(str) >>> 0).toString(16)
        ),
        allowlist: allLists.whitelist.map((str) =>
          (crc32.str(str) >>> 0).toString(16)
        ),
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
