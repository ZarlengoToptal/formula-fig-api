import express from "express";
import auth from "./auth.js";
import admin from "./admin.js";
import user from "./user/index.js";
import { validJWTNeeded } from "../middleware/authentication.js";
import SHOPIFY from "../api/shopify/index.js";
import MBO from "../api/mbo/index.js";

const app = express();

app.use("/auth", auth);
app.use("/admin", admin);
app.use("/user", validJWTNeeded, user);
app.use("/test", async (req, res) => {
  if (process.env.debug) console.log("GET:/test");
  if (!SHOPIFY.verifyShopifyCustomerData(req.body)) {
    return res.send("Failed Verified").end();
  }
  const response = await SHOPIFY.addCustomer(req.body);
  if (process.env.debug) console.log(JSON.stringify(response, null, 2));
  res.json("SUCCESS").end();
});

export default app;

/*
// Create or Update an item
app.post("/:col/:key", async (req, res) => {
  console.log(req.body);

  const col = req.params.col;
  const key = req.params.key;
  console.log(
    `from collection: ${col} delete key: ${key} with params ${JSON.stringify(
      req.params
    )}`
  );
  const item = await db.collection(col).set(key, req.body);
  console.log(JSON.stringify(item, null, 2));
  res.json(item).end();
});

// Delete an item
app.delete("/:col/:key", async (req, res) => {
  const col = req.params.col;
  const key = req.params.key;
  console.log(
    `from collection: ${col} delete key: ${key} with params ${JSON.stringify(
      req.params
    )}`
  );
  const item = await db.collection(col).delete(key);
  console.log(JSON.stringify(item, null, 2));
  res.json(item).end();
});

// Get a single item
app.get("/:col/:key", async (req, res) => {
  const col = req.params.col;
  const key = req.params.key;
  console.log(
    `from collection: ${col} get key: ${key} with params ${JSON.stringify(
      req.params
    )}`
  );
  const item = await db.collection(col).get(key);
  console.log(JSON.stringify(item, null, 2));
  res.json(item).end();
});

// Get a full listing
app.get("/:col", async (req, res) => {
  const col = req.params.col;
  console.log(
    `list collection: ${col} with params: ${JSON.stringify(req.params)}`
  );
  const items = await db.collection(col).list();
  console.log(JSON.stringify(items, null, 2));
  res.json(items).end();
});
*/
