import { Router } from "express";
import MBO from "../../api/mbo/index.js";
const { CreditCard } = MBO.Client;
const router = Router();

router.get("/", async (req, res) => {
  const response = await CreditCard.get(req.mboClientId);
  console.log(JSON.stringify(response, null, 2));
  res.json(response).end();
});

router.delete("/", async (req, res) => {
  const response = await CreditCard.delete(req.mboClientId);
  console.log(JSON.stringify(response, null, 2));
  res.json(response).end();
});

router.post("/", async (req, res) => {
  const response = await CreditCard.update(req.mboClientId, req.body);
  console.log(JSON.stringify(response, null, 2));
  res.json(response).end();
});

export default router;
