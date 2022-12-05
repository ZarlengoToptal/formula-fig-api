import { Router } from "express";
import MBO from "../../api/mbo/index.js";
const { addClientToClass, removeClientFromClass, Visits } = MBO.Client;
const router = Router();

// Remove a client from a class
router.delete("/:classId", async (req, res) => {
  if (process.env.debug) console.log("DELETE:/user/visits/:classId");
  const response = await removeClientFromClass(req.mboClientId, classId);
  if (process.env.debug) console.log(JSON.stringify(response, null, 2));
  res.json(response).end();
});

// Add a client to a class
router.post("/:classId", async (req, res) => {
  if (process.env.debug) console.log("POST:/user/visits/:classId");
  const { classId } = req.params;
  const response = await addClientToClass(req.mboClientId, classId);
  if (process.env.debug) console.log(JSON.stringify(response, null, 2));
  res.json(response).end();
});

router.get("/", async (req, res) => {
  if (process.env.debug) console.log("GET:/user/visits");
  const response = await Visits.get(req.mboClientId);
  if (process.env.debug) console.log(JSON.stringify(response, null, 2));
  res.json(response).end();
});

export default router;
