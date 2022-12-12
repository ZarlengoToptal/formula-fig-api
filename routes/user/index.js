import express from "express";
import creditCard from "./creditCard.js";
import visits from "./visits.js";
import { getStoreIds } from "../../middleware/getStoreIds.js";
import MBO from "../../api/mbo/index.js";
import SHOPIFY from "../../api/shopify/index.js";
const { getMBOClientObject, updateMBOClientObject } = MBO.Client;
const { getClassScheduleId, getClassesByScheduleId } = MBO.Class;
const { getShopifyCustomerObject } = SHOPIFY;

const app = express();

app.use("/creditCard", getStoreIds, creditCard);
app.use("/visits", getStoreIds, visits);

const router = express.Router();

// Get a client info
router.get("/account", getStoreIds, async (req, res) => {
  if (process.env.debug) console.log("GET:user/account");
  console.log("locals", res.locals);
  const mboResponse = await getMBOClientObject(res.locals.mboClientId);
  if (process.env.debug) console.log(JSON.stringify(mboResponse, null, 2));
  res.json(mboResponse).end();
});

// Get a client info
router.get("/orders", getStoreIds, async (req, res) => {
  if (process.env.debug) console.log("GET:user/orders");
  const orders = await getShopifyCustomerObject(res.locals.shopifyCustomerId);
  if (process.env.debug) console.log(JSON.stringify(orders, null, 2));
  res.json(orders).end();
});

// reschedule
router.get("/reschedule/:classId", async (req, res) => {
  if (process.env.debug) console.log("GET:user/reschedule/:classId");
  const { classId } = req.params;
  const { startDate, endDate } = req.query;
  const classScheduleId = await getClassScheduleId(classId);
  const Classes = await getClassesByScheduleId(
    classScheduleId,
    startDate,
    endDate
  );
  if (process.env.debug) console.log(JSON.stringify(Classes, null, 2));
  res.json(Classes).end();
});

// reschedule
router.put("/update", getStoreIds, async (req, res) => {
  if (process.env.debug) console.log("POST:user/update");
  console.log({ body: req.body });
  const response = await updateMBOClientObject(
    res.locals.mboClientId,
    req.body
  );
  if (process.env.debug) console.log(JSON.stringify(response, null, 2));
  res.json(response).end();
});

app.use("/", router);

export default app;
