import { URL } from "url";

export default (url: string): ParsedURL => {
  url =
    url.startsWith("http://") || url.startsWith("https://")
      ? url
      : `http://${url}`;
  const urlObj = new URL(url);
  return {
    hostname: urlObj.hostname,
    tld: urlObj.hostname.split(".").pop(),
  };
};
