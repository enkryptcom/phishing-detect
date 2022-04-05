import { expect } from "chai";
import URLParser from "../src/utils/parse-url";

describe("Properly pass urls to hostname", () => {
  // the tests container
  it("it should parse urls", async () => {
    expect(URLParser("xn--myetherwallt-leb.com").hostname).to.be.equals(
      "xn--myetherwallt-leb.com"
    );
    expect(URLParser("https://xn--myetherwallt-leb.com").hostname).to.be.equals(
      "xn--myetherwallt-leb.com"
    );
    expect(URLParser("https://xn--myetherwallt-leb.com").tld).to.be.equals(
      "com"
    );
  });
});
