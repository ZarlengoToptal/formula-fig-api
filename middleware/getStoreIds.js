import db from "cyclic-dynamodb";
const User = db.collection("user");

export const getStoreIds = async (req, res, next) => {
  if (!res.locals.key) {
    console.log("No user key found");
    return res.status(201).send();
  }

  const { results } = await User.filter({ key: res.locals.key });
  console.log("store", results.length);
  if (results.length === 0) {
    console.log(res.locals.key, "does not have store id");
    return res.status(201).end();
  }
  const { props } = results[0];
  res.locals.mboClientId = props["MBO_-99"];
  res.locals.shopifyCustomerId = props["shopifyCustomerId"];
  return next();
};
