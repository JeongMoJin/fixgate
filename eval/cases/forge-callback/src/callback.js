const forge = require("node-forge");

// The gateway only redirects to partner hosts it knows, so it splits the callback URL first.
function callbackTarget(url) {
  const parsed = forge.util.parseUrl(url);
  return { scheme: parsed.scheme, host: parsed.host, port: parsed.port };
}

module.exports = { callbackTarget };
