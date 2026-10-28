const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const crypto = require("node:crypto");
const { createApp } = require("../src/app");

// The production key pair is 1024-bit RSA, issued before the 2048-bit policy.
const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 1024,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

let server;
let inventory;
let base;

before(async () => {
  inventory = http.createServer((req, res) => {
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ stock: req.url.endsWith("/A-1") ? 7 : 0 }));
  });
  await new Promise((resolve) => inventory.listen(0, resolve));
  const app = createApp({ privateKey, publicKey, inventoryUrl: `http://127.0.0.1:${inventory.address().port}` });
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  server.close();
  inventory.close();
});

test("login issues a token that /me accepts", async () => {
  const login = await fetch(`${base}/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ userId: "u-42" }),
  });
  assert.equal(login.status, 200);
  const { token } = await login.json();
  const me = await fetch(`${base}/me`, { headers: { authorization: `Bearer ${token}` } });
  assert.deepEqual(await me.json(), { userId: "u-42" });
});

test("me rejects a forged token", async () => {
  const me = await fetch(`${base}/me`, { headers: { authorization: "Bearer not-a-token" } });
  assert.equal(me.status, 401);
});

test("stock is read from the inventory service", async () => {
  const res = await fetch(`${base}/stock/A-1`);
  assert.deepEqual(await res.json(), { sku: "A-1", stock: 7 });
});

test("receipt renders order totals", async () => {
  const res = await fetch(`${base}/receipt`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ orderId: "O-1", items: [{ price: 1200, qty: 2 }, { price: 500, qty: 1 }] }),
  });
  assert.equal(await res.text(), "주문 O-1 · 2개 · 합계 2900원");
});
