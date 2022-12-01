const express = require("express");
const router = express.Router();
const db = require("cyclic-dynamodb");
const { v4: uuidv4 } = require("uuid");
const { userCheck, createToken } = require("../utils/common");

// Get all client info
router.get("/all", async (req, res) => {
  const users = await db.collection("user").list();
  const { results } = users;
  if (results?.length === 0) {
    res.status(201).end();
    return;
  }
  const allUsers = {};
  for (let i = 0; i < results.length; i++) {
    const { key } = results[i];
    const { props } = await db.collection("user").get(key);
    allUsers[key] = props;
  }
  res.json(allUsers).end();
});

module.exports = router;
