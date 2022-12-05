import { Router } from "express";
import db from "cyclic-dynamodb";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
const router = Router();

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

router.delete("/user/:key", async (req, res) => {
  const { key } = req.params;
  const all = await db.collection("user").list();
  console.log(all.results);
  const response = await db.collection("user").get(key);
  if (!response || response?.results?.length === 0) {
    res.status(400).json({ error: "Key does not exist" });
    return;
  }
  const item = await db.collection("user").delete(key);
  console.log(JSON.stringify(item, null, 2));
  res.json(item).end();
});
router.post("/createUser", async (req, res) => {
  const { email, password, mboClientId, shopifyCustomerId } = req.body;
  // Verify the input data has all the required fields
  if (!email || !password || !mboClientId || !shopifyCustomerId) {
    return res.status(400).send("Invalid data");
  }
  const salt = await bcrypt.genSalt(10);
  const apiObject = {
    email,
    password: await bcrypt.hash(password, salt),
    "MBO_-99": mboClientId,
    shopifyCustomerId,
  };
  try {
    const key = uuidv4(); // ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
    await db.collection("user").set(key, apiObject);
    res.status(201).send({ key });
  } catch (err) {
    console.log({ err });
    res.status(500).send({ errors: err });
  }
  return;
});
export default router;
