const express = require("express");
const router = express.Router();
const db = require("cyclic-dynamodb");
const axios = require("axios").create({
  baseUrl: "https://jsonplaceholder.typicode.com/",
});
const {
  getMBOClientData,
  getMBOClientObject,
  getMBOClientVisits,
  removeClientFromClass,
  addClientToClass,
  getClassReschedule,
} = require("../utils/mbo");

// Get a client info
router.get("/account", async (req, res) => {
  const { results } = await db.collection("user").filter(req.key);
  if (results.length === 0) {
    console.log("??", { results });
    res.status(201).end();
    return;
  }
  const { props } = results[0];
  const mboClientId = props["MBO_-99"];
  console.log({ mboClientId });
  const response = await getMBOClientObject(mboClientId);
  console.log("resp", JSON.stringify(response, null, 2));
  res.json(response).end();
});
// Get a client visits
router.get("/visits", async (req, res) => {
  const { results } = await db.collection("user").filter(req.key);
  if (results.length === 0) {
    res.status(201).end();
    return;
  }
  const { props } = results[0];
  const mboClientId = props["MBO_-99"];
  const response = await getMBOClientVisits(mboClientId);
  // console.log(JSON.stringify(response, null, 2));
  res.json(response).end();
});

// Remove a client from a class
router.delete("/visit/:classId", async (req, res) => {
  const { results } = await db.collection("user").filter(req.key);
  const { classId } = req.params;
  if (results.length === 0) {
    res.status(201).end();
    return;
  }
  const { props } = results[0];
  const mboClientId = props["MBO_-99"];
  const response = await removeClientFromClass(mboClientId, classId);
  console.log(JSON.stringify(response, null, 2));
  res.json(response).end();
});

// Remove a client from a class
router.post("/visit/:classId", async (req, res) => {
  const { results } = await db.collection("user").filter(req.key);
  const { classId } = req.params;
  if (results.length === 0) {
    res.status(201).end();
    return;
  }
  const { props } = results[0];
  const mboClientId = props["MBO_-99"];
  const response = await addClientToClass(mboClientId, classId);
  console.log(JSON.stringify(response, null, 2));
  res.json(response).end();
});

// Get all client info
router.get("/all", async (req, res) => {
  const { results } = await db.collection("user");
  if (results.length === 0) {
    res.status(201).end();
    return;
  }
  console.log(JSON.stringify(results, null, 2));
  res.json(results).end();
});

// Get all client info
router.get("/reschedule/:classId", async (req, res) => {
  const { classId } = req.params;
  const response = await getClassReschedule(classId);
  console.log(JSON.stringify(response, null, 2));
  res.json(response).end();
});

module.exports = router;
