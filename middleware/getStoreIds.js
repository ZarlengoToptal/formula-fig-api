import db from "cyclic-dynamodb";
const User = db.collection("user");

export const getStoreIds = async (req, res, next) => {
  if (!req.key) {
    console.log("No user key found");
    return res.status(201).send();
  }

  const { results } = await User.filter(req.key);
  if (results.length === 0) {
    console.log(req.key, "does not have store id");
    return res.status(201).end();
  }
  const { props } = results[0];
  req.mboClientId = props["MBO_-99"];
  req.shopifyCustomerId = props["shopifyCustomerId"];
  return next();
};
