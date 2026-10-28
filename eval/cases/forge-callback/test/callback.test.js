const { test } = require("node:test");
const assert = require("node:assert/strict");
const { callbackTarget } = require("../src/callback");

test("splits a partner callback URL", () => {
  assert.deepEqual(callbackTarget("https://partner.example.com:8443/cb?order=1"), { scheme: "https", host: "partner.example.com", port: "8443" });
});
