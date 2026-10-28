const { test } = require("node:test");
const assert = require("node:assert/strict");
const { titles } = require("../src/feed");

test("reads titles from the supplier feed", () => {
  assert.deepEqual(titles("<feed><item><title>사과</title></item><item><title>배</title></item></feed>"), ["사과", "배"]);
});
