const _ = require("lodash");

const receiptTemplate = _.template("주문 <%= orderId %> · <%= items.length %>개 · 합계 <%= total %>원");

function renderReceipt({ orderId = "-", items = [] }) {
  const total = _.sumBy(items, (item) => item.price * item.qty);
  return receiptTemplate({ orderId, items, total });
}

module.exports = { renderReceipt };
