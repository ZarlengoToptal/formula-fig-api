const express = require("express");
const router = express.Router();
const db = require("cyclic-dynamodb");

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

module.exports = router;
