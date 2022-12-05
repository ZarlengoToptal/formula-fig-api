import express from "express";
import creditCard from "./creditCard.js";
import visits from "./visits.js";
import { getStoreIds } from "../../middleware/getStoreIds.js";
import MBO from "../../api/mbo/index.js";
import SHOPIFY from "../../api/shopify/index.js";
const { getMBOClientObject } = MBO.Client;
const { getClassScheduleId, getClassesByScheduleId } = MBO.Class;
const { getShopifyCustomerObject } = SHOPIFY;

const app = express();

app.use("/creditCard", getStoreIds, creditCard);
app.use("/visits", getStoreIds, visits);

const router = express.Router();

// Get a client info
router.get("/account", getStoreIds, async (req, res) => {
  console.log("GET:user/Account");
  const mboResponse = await getMBOClientObject(req.mboClientId);
  res.json(mboResponse).end();
});

// Get a client info
router.get("/orders", getStoreIds, async (req, res) => {
  const orders = await getShopifyCustomerObject(req.shopifyCustomerId);
  res.json(orders).end();
});

// reschedule
router.get("/reschedule/:classId", async (req, res) => {
  const { classId } = req.params;
  const classScheduleId = await getClassScheduleId(classId);
  const Classes = await getClassesByScheduleId(classScheduleId);
  res.json(Classes).end();
});

app.use("/", router);

export default app;
