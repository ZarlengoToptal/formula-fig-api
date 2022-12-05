import { Router } from "express";
import MBO from "../../api/mbo/index.js";
const { addClientToClass, removeClientFromClass, Visits } = MBO.Client;
const router = Router();

// Remove a client from a class
router.delete("/:classId", async (req, res) => {
  const response = await removeClientFromClass(req.mboClientId, classId);
  res.json(response).end();
});

// Add a client to a class
router.post("/:classId", async (req, res) => {
  const { classId } = req.params;
  const response = await addClientToClass(req.mboClientId, classId);
  res.json(response).end();
});

router.get("/", async (req, res) => {
  const response = await Visits.get(req.mboClientId);
  res.json(response).end();
});

export default router;
