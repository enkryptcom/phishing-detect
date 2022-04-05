interface ListDownloader {
  fuzzylist: string[];
  blacklist: string[];
  whitelist: string[];
}

interface MetamaskList {
  fuzzylist: string[];
  whitelist: string[];
  blacklist: string[];
}
interface PolkadotList {
  allow: string[];
  deny: string[];
}

interface ParsedURL {
  hostname: string;
  tld: string;
}

type ExampleType = {
  platform: string;
  version: string;
};
