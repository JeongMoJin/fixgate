const express = require("express");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { renderReceipt } = require("./receipt");

// Legacy service: tokens are signed with an RSA key issued years ago.
function createApp({ privateKey, publicKey, inventoryUrl }) {
  const app = express();
  app.use(express.json());

  app.post("/login", (req, res) => {
    const { userId } = req.body || {};
    if (!userId) return res.status(400).json({ error: "userId required" });
    const token = jwt.sign({ sub: userId }, privateKey, { algorithm: "RS256", expiresIn: "1h" });
    res.json({ token });
  });

  app.get("/me", (req, res) => {
    const token = (req.headers.authorization || "").replace(/^Bearer /, "");
    try {
      const claims = jwt.verify(token, publicKey, { algorithms: ["RS256"] });
      res.json({ userId: claims.sub });
    } catch {
      res.status(401).json({ error: "invalid token" });
    }
  });

  app.get("/stock/:sku", async (req, res) => {
    try {
      const { data } = await axios.get(`${inventoryUrl}/items/${encodeURIComponent(req.params.sku)}`);
      res.json({ sku: req.params.sku, stock: data.stock });
    } catch {
      res.status(502).json({ error: "inventory unavailable" });
    }
  });

  app.post("/receipt", (req, res) => {
    res.type("text/plain").send(renderReceipt(req.body || {}));
  });

  return app;
}

module.exports = { createApp };
