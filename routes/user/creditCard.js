import { Router } from "express";
import MBO from "../../api/mbo/index.js";
const { CreditCard } = MBO.Client;
const router = Router();

router.get("/", async (req, res) => {
  if (process.env.debug) console.log("GET:/user/creditCard");
  const response = await CreditCard.get(req.mboClientId);
  if (process.env.debug) console.log(JSON.stringify(response, null, 2));
  res.json(response).end();
});

router.delete("/", async (req, res) => {
  if (process.env.debug) console.log("DELETE:/user/creditCard");
  const response = await CreditCard.delete(req.mboClientId);
  if (process.env.debug) console.log(JSON.stringify(response, null, 2));
  res.json(response).end();
});

router.post("/", async (req, res) => {
  if (process.env.debug) console.log("POST:/user/creditCard");
  const response = await CreditCard.update(req.mboClientId, req.body);
  if (process.env.debug) console.log(JSON.stringify(response, null, 2));
  res.json(response).end();
});

export default router;
