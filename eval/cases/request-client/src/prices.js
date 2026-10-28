const request = require("request");

// Asks a partner's price API for one product. Partners send their own base URL.
function fetchPrice(baseUrl, sku, done) {
  request.get({ url: `${baseUrl}/prices/${encodeURIComponent(sku)}`, json: true, timeout: 3000 }, (err, res, body) => {
    if (err) return done(err);
    if (res.statusCode !== 200) return done(new Error(`partner returned ${res.statusCode}`));
    done(null, body.price);
  });
}

module.exports = { fetchPrice };
