import { Router } from "express";
import MBO from "../../api/mbo/index.js";
const { addClientToClass, removeClientFromClass } = MBO.Class;
const router = Router();

// Remove a client from a class
router.delete("/:classId", async (req, res) => {
  const { classId } = req.params;
  if (process.env.debug) console.log("DELETE:/user/visits/:classId", classId);
  const response = await removeClientFromClass(req.mboClientId, classId);
  if (process.env.debug) console.log(JSON.stringify(response, null, 2));
  res.json(response).end();
});

// Add a client to a class
router.post("/:classId", async (req, res) => {
  const { classId } = req.params;
  if (process.env.debug) console.log("POST:/user/visits/:classId", classId);
  const response = await addClientToClass(req.mboClientId, classId);
  if (process.env.debug) console.log(JSON.stringify(response, null, 2));
  res.json(response).end();
});

router.get("/", async (req, res) => {
  if (process.env.debug) console.log("GET:/user/visits");
  const response = await MBO.Client.Visits.get(req.mboClientId);
  if (process.env.debug) console.log(JSON.stringify(response, null, 2));
  res.json(response).end();
});

export default router;
