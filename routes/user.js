const express = require("express");
const router = express.Router();
const db = require("cyclic-dynamodb");
const axios = require("axios").create({
  baseUrl: "https://jsonplaceholder.typicode.com/",
});
const { getMBOClientData } = require("../utils/mbo");
const getMBOClientObject = async (mboId) => {
  try {
    const response = await axios({
      url: `https://api.mindbodyonline.com/public/v6/client/clients?ClientIds=${mboId}`,
      method: "get",
      headers: {
        "Api-Key": "aef3102e08bf4652ab8fbfd0b090d3fc",
        SiteId: "-99",
      },
    });
    return getMBOClientData(response.data.Clients[0]);
  } catch (err) {
    console.log(err);
    return false;
  }
};

// Get a client info
router.get("/account", async (req, res) => {
  const { results } = await db.collection("user").filter(req.key);
  if (results.length === 0) {
    res.status(201).end();
    return;
  }
  const { props } = results[0];
  const mboClientId = props["MBO_-99"];
  const response = await getMBOClientObject(mboClientId);
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

module.exports = router;
