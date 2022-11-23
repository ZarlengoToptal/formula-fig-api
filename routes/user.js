const express = require("express");
const router = express.Router();
const db = require("cyclic-dynamodb");
const axios = require("axios").create({
  baseUrl: "https://jsonplaceholder.typicode.com/",
});

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

const getMBOClientData = (client) => {
  return {
    FirstName: client.FirstName || "",
    LastName: client.LastName || "",
    Email: client.Email || "",
    Phone: client.HomePhone || "",
    BirthDate: client.BirthDate || "",
    AddressLine1: client.AddressLine1 || "",
    AddressLine2: client.AddressLine2 || "",
    City: client.City || "",
    State: client.State || "",
    PostalCode: client.PostalCode || "",
    Country: client.Country || "",
    MobilePhone: client.MobilePhone || "",
    SendAccountEmails: client.SendAccountEmails || "",
    SendAccountTexts: client.SendAccountTexts || "",
    SendPromotionalEmails: client.SendPromotionalEmails || "",
    SendPromotionalTexts: client.SendPromotionalTexts || "",
    SendScheduleEmails: client.SendScheduleEmails || "",
    SendScheduleTexts: client.SendScheduleTexts || "",
  };
};

// Get a client info
router.get("/account", async (req, res) => {
  const { token } = req;
  const { results } = await db.collection("user").filter({ token });
  if (results.length === 0) {
    res.status(201).end();
    return;
  }
  const { props } = results[0];
  console.log({ props });
  const mboClientId = props["MBO_-99"];
  const response = await getMBOClientObject(mboClientId);
  console.log(JSON.stringify(response, null, 2));
  res.json(response).end();
});

module.exports = router;
