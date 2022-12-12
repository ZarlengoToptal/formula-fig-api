import { Router } from "express";
import db from "cyclic-dynamodb";
import { v4 as uuidv4 } from "uuid";

import {
  userCheck,
  createToken,
  getClientIpAddr,
  checkPassword,
} from "../utils/common.js";
import { verifyApiData, createApiObject } from "../utils/api.js";
import MBO from "../api/mbo/index.js";
import SHOPIFY from "../api/shopify/index.js";
import { createMultipassToken } from "../utils/shopify.js";
import { validJWTNeeded } from "../middleware/authentication.js";

const router = Router();
const { verifyMBOClientData, addClient, findByEmail } = MBO.Client;
const { addCustomer, getCustomerByEmail, verifyShopifyCustomerData } = SHOPIFY;

router.post("/register", async (req, res) => {
  if (process.env.debug) console.log("POST:/auth/register");
  // Verify the input data has all the required fields
  if (
    !verifyMBOClientData(req.body) ||
    !verifyShopifyCustomerData(req.body) ||
    !verifyApiData(req.body)
  ) {
    return res.status(400).send("Invalid data");
  }
  // Check if in SSO system
  if (await userCheck(req.body.email, res)) return;
  const key = uuidv4(); // ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
  // Check if exists in MBO
  const MBOClients = await findByEmail(req.body.email);
  // Check if exists in Shopify
  const ShopifyCustomers = await getCustomerByEmail(req.body.email);
  if (process.env.debug) console.log({ MBOClients, ShopifyCustomers });
  if (MBOClients.length + ShopifyCustomers.length > 0) {
    return res
      .status(403)
      .send(
        "Account already exists, please check your email for activation steps."
      );
  }

  // Create the new user in MBO
  const mboId = await addClient(req.body);
  if (!mboId) {
    res.status(400).json({ error: "Error creating MBO client object" });
    return;
  }
  req.body["MBO_-99"] = mboId;

  // Create the new user in Shopify
  const shopifyId = await addCustomer(req.body);
  if (!shopifyId) {
    res.status(400).json({ error: "Error creating Shopify client object" });
    return;
  }
  req.body["shopifyCustomerId"] = shopifyId;

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

router.post("/logout", validJWTNeeded, async (req, res) => {
  if (process.env.debug) console.log("POST:/auth/logout");
  const { key } = req;
  const user = await db.collection("user").get(key);
  if (!user) {
    res.status(201).end();
    return;
  }
  const { props } = user;
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
  if (process.env.debug) console.log("POST:/auth/login");
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
    if (process.env.debug) console.log(JSON.stringify(url, null, 2));
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
  if (process.env.debug) console.log(JSON.stringify(url, null, 2));
  res.json(url).end();
  // res.redirect(url);
});

export default router;
