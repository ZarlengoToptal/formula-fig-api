const db = require("cyclic-dynamodb");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

exports.validJWTNeeded = (req, res, next) => {
  if (req.headers["authorization"]) {
    try {
      let authorization = req.headers["authorization"].split(" ");
      if (authorization[0] !== "Bearer") {
        e;
        return res.status(401).send();
      } else {
        const { key } = jwt.verify(authorization[1], jwtSecret);
        req.key = key;
        return next();
      }
    } catch (err) {
      console.log({ err });
      return res.status(403).send();
    }
  } else {
    return res.status(401).send();
  }
};
