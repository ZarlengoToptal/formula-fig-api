const express = require("express");
const router = express.Router();

const db = require("cyclic-dynamodb");
const Multipassify = require("multipassify");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const axios = require("axios").create({
  baseUrl: "https://jsonplaceholder.typicode.com/",
});

const { validJWTNeeded } = require("../middleware/authentication");

const jwtSecret = "mysecret";

// Construct the Multipassify encoder
const multipassify = new Multipassify(process.env.MULTIPASS_SECRET);
const shopifyStoreURL = `${process.env.SHOPIFY_STORE_NAME}.myshopify.com`;

const createMultipassToken = async ({ email, first_name, last_name }) => {
  // Create your customer data hash
  const customerData = {
    email,
    first_name,
    last_name,
    // remote_ip: "76.22.68.10", //ip,
    created_at: new Date().toISOString(),
  };
  // Generate a Shopify multipass URL to your shop
  return multipassify.generateUrl(customerData, shopifyStoreURL);
};

const getClientIpAddr = ({ headers, socket }) => {
  const isIPValid = (ipToCheck) => {
    return (
      ipToCheck == null ||
      ipToCheck.length() === 0 ||
      ipToCheck.equalsIgnoreCase("unknown")
    );
  };

  let ip = headers["X-Forwarded-For"];
  if (isIPValid(ip)) {
    ip = headers["Proxy-Client-IP"];
  }
  if (isIPValid(ip)) {
    ip = headers["WL-Proxy-Client-IP"];
  }
  if (isIPValid(ip)) {
    ip = headers["HTTP_X_FORWARDED_FOR"];
  }
  if (isIPValid(ip)) {
    ip = headers["HTTP_X_FORWARDED"];
  }
  if (isIPValid(ip)) {
    ip = headers["HTTP_X_CLUSTER_CLIENT_IP"];
  }
  if (isIPValid(ip)) {
    ip = headers["HTTP_CLIENT_IP"];
  }
  if (isIPValid(ip)) {
    ip = headers["HTTP_FORWARDED_FOR"];
  }
  if (isIPValid(ip)) {
    ip = headers["HTTP_FORWARDED"];
  }
  if (isIPValid(ip)) {
    ip = headers["HTTP_VIA"];
  }
  if (isIPValid(ip)) {
    ip = headers["REMOTE_ADDR"];
  }
  if (isIPValid(ip)) {
    ip = socket.remoteAddress;
  }
  return ip;
};

router.post("/register", async (req, res) => {
  const { email, password, firstname, lastname, AddressLine1 } = req.body;
  const { results } = await db.collection("user").filter({ email });
  if (results.length !== 0) {
    res.status(400).json({ error: "Email already exists" });
    return;
  }
  const key = uuidv4(); // ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
  const mboId = await createMBOClientObject(req.body);
  if (!mboId) {
    res.status(400).json({ error: "Error creating MBO client object" });
    return;
  }
  req.body["MBO_-99"] = mboId;
  try {
    let refreshId = email + jwtSecret;
    let salt = crypto.randomBytes(16).toString("base64");
    let hash = crypto
      .createHmac("sha512", salt)
      .update(refreshId)
      .digest("base64");
    req.body.refreshKey = salt;
    let token = jwt.sign(req.body, jwtSecret);
    req.body.token = token;
    let b = Buffer.from(hash);
    let refresh_token = b.toString("base64");
    req.body.refresh_token = refresh_token;
    await db.collection("user").set(key, req.body);
    const url = await createMultipassToken({
      email,
      ip: getClientIpAddr(req),
      first_name: firstname,
      last_name: lastname,
    });
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
  if (!key || !props || password !== props.password) {
    res.status(403).end();
    return;
  }

  try {
    let refreshId = email + jwtSecret;
    let salt = crypto.randomBytes(16).toString("base64");
    let hash = crypto
      .createHmac("sha512", salt)
      .update(refreshId)
      .digest("base64");
    req.body.refreshKey = salt;
    let token = jwt.sign(req.body, jwtSecret);
    props.token = token;
    let b = Buffer.from(hash);
    let refresh_token = b.toString("base64");
    props.refresh_token = refresh_token;
    delete props.created;
    delete props.updated;
    await db.collection("user").delete(key);
    await db.collection("user").set(key, props);
    const url = await createMultipassToken({
      email,
      ip: getClientIpAddr(req),
    });
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

const createMBOClientData = (client) => {
  return {
    FirstName: client.firstname || "FirstName",
    LastName: client.lastname || "LastName",
    Email: client.email || "",
    BirthDate: client.BirthDate || "1/1/2000",
    AddressLine1: client.AddressLine1 || "1 Address",
    City: client.City || "City",
    State: client.State || "ST",
    PostalCode: client.PostalCode || "12345",
    MobilePhone: client.MobilePhone || "1-234-567-8901",
    ReferredBy: client.ReferredBy || "ReferredBy",
  };
};

const createMBOClientObject = async (data) => {
  try {
    const response = await axios({
      url: "https://api.mindbodyonline.com/public/v6/client/addclient",
      method: "post",
      headers: {
        "Api-Key": "aef3102e08bf4652ab8fbfd0b090d3fc",
        SiteId: "-99",
      },
      data: createMBOClientData(data),
    });
    return response.data.Client.Id;
  } catch (err) {
    console.log(err);
    return false;
  }
};

module.exports = router;
