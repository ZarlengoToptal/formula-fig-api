const express = require("express");
const router = express.Router();

const db = require("cyclic-dynamodb");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const {
  userCheck,
  createToken,
  getClientIpAddr,
  checkPassword,
} = require("../utils/common");
const { verifyApiData, createApiObject } = require("../utils/api");
const { verifyMBOClientData, createMBOClientObject } = require("../utils/mbo");
const {
  verifyShopifyClientData,
  createMultipassToken,
} = require("../utils/shopify");

const { validJWTNeeded } = require("../middleware/authentication");

const jwtSecret = "mysecret";

router.post("/register", async (req, res) => {
  // Verify the input data has all the required fields
  if (
    !verifyMBOClientData(req.body) ||
    !verifyShopifyClientData(req.body) ||
    !verifyApiData(req.body)
  ) {
    return res.status(400).send("Invalid data");
  }
  // Check if in SSO system
  if (await userCheck(req.body.email, res)) return;
  const key = uuidv4(); // ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
  const mboId = await createMBOClientObject(req.body);
  if (!mboId) {
    res.status(400).json({ error: "Error creating MBO client object" });
    return;
  }
  req.body["MBO_-99"] = mboId;
  try {
    const { token, refresh_token } = createToken(key);
    await db
      .collection("user")
      .set(key, await createApiObject(req.body, token, refresh_token));
    const url = await createMultipassToken(req.body);
    res
      .status(201)
      .send({ accessToken: token, refreshToken: refresh_token, url });
  } catch (err) {
    console.log({ err });
    res.status(500).send({ errors: err });
  }
  return;
});

router.delete("/delete/:key", async (req, res) => {
  const { key } = req.params;
  const all = await db.collection("user").list();
  console.log(all.results);
  const response = await db.collection("user").get(key);
  if (!response || response?.results?.length === 0) {
    res.status(400).json({ error: "Key does not exist" });
    return;
  }
  const item = await db.collection("user").delete(key);
  console.log(JSON.stringify(item, null, 2));
  res.json(item).end();
});

router.post("/logout", validJWTNeeded, async (req, res) => {
  const { token } = req;
  const { results } = await db.collection("user").filter({ token });
  if (results.length === 0) {
    res.status(201).end();
    return;
  }
  const { key, props } = results[0];
  try {
    delete props.token;
    delete props.refresh_token;
    delete props.created;
    delete props.updated;
    await db.collection("user").delete(key);
    await db.collection("user").set(key, props);
    res.status(201).end();
  } catch (err) {
    console.log({ err });
    res.status(500).send({ errors: err });
  }
  return;
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const { results } = await db.collection("user").filter({ email });
  if (results.length === 0) {
    res.status(403).end();
    return;
  }
  const { key, props } = results[0];
  if (!key || !props) {
    res.status(403).end();
    return;
  }
  if (await checkPassword(key, password, res)) return;
  try {
    const { token, refresh_token } = createToken(key);
    props.token = token;
    props.refresh_token = refresh_token;
    delete props.created;
    delete props.updated;
    await db.collection("user").delete(key);
    await db.collection("user").set(key, props);
    const url = await createMultipassToken(req.body);
    res
      .status(201)
      .send({ accessToken: token, refreshToken: refresh_token, url });
  } catch (err) {
    console.log({ err });
    res.status(500).send({ errors: err });
  }
  return;
});

router.get("/shopify-login/:email", async (req, res) => {
  const url = await createMultipassToken({
    email: req.params.email,
    ip: getClientIpAddr(req),
  });
  res.json(url).end();
  // res.redirect(url);
});

module.exports = router;
