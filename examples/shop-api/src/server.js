const fs = require("node:fs");
const { createApp } = require("./app");

const app = createApp({
  privateKey: fs.readFileSync(process.env.JWT_PRIVATE_KEY_PATH, "utf8"),
  publicKey: fs.readFileSync(process.env.JWT_PUBLIC_KEY_PATH, "utf8"),
  inventoryUrl: process.env.INVENTORY_URL,
});

app.listen(Number(process.env.PORT) || 3000);
