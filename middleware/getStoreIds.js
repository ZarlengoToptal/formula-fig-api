import db from "cyclic-dynamodb";
const User = db.collection("user");

export const getStoreIds = async (req, res, next) => {
  if (!res.locals.key) {
    console.log("No user key found");
    return res.status(201).send();
  }

  const user = await User.get(res.locals.key);
  if (!user) {
    console.log(res.locals.key, "does not have store id");
    return res.status(201).end();
  }
  const { props } = user;
  res.locals.mboClientId = props["MBO_-99"];
  res.locals.shopifyCustomerId = props["shopifyCustomerId"];
  return next();
};
