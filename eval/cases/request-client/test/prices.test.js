const { test } = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const { fetchPrice } = require("../src/prices");

test("reads a price from the partner API", async () => {
  const server = http.createServer((req, res) => res.end(JSON.stringify({ price: req.url.endsWith("/A-1") ? 1200 : 0 })));
  await new Promise((r) => server.listen(0, r));
  const price = await new Promise((resolve, reject) => fetchPrice(`http://127.0.0.1:${server.address().port}`, "A-1", (e, p) => (e ? reject(e) : resolve(p))));
  server.close();
  assert.equal(price, 1200);
});
