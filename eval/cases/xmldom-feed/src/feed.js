const { DOMParser } = require("xmldom");

// Reads product titles from a supplier's XML feed.
function titles(xml) {
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  return Array.from(doc.getElementsByTagName("title")).map((node) => node.textContent);
}

module.exports = { titles };
