const { test } = require("node:test");
const assert = require("node:assert/strict");
const { greeting } = require("../src/greeting");

test("greets the member by full name", () => {
  assert.equal(greeting("길동", "홍", 2), "홍길동님, 주문 2건이 도착했습니다");
});
