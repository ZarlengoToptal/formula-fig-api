const db = require("cyclic-dynamodb");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const jwtSecret = process.env.JWT_SECRET;

const userCheck = async (email, res) => {
  const { results } = await db.collection("user").filter({ email });
  if (results.length !== 0) {
    console.log("User already exists", email);
    res.status(400).json({ error: "Email already exists" });
    return true;
  }
  return false;
};

const createToken = (key) => {
  const refreshId = key + jwtSecret;
  const salt = crypto.randomBytes(16).toString("base64");
  const hash = crypto
    .createHmac("sha512", salt)
    .update(refreshId)
    .digest("base64");
  const token = jwt.sign({ key }, jwtSecret, { expiresIn: "1w" });
  const b = Buffer.from(hash);
  const refresh_token = b.toString("base64");
  return { token, refresh_token };
};

const getClientIpAddr = ({ headers, socket }) => {
  const isIPValid = (ipToCheck) => {
    return (
      ipToCheck == null ||
      ipToCheck.length() === 0 ||
      ipToCheck.equalsIgnoreCase("unknown")
    );
  };

  let ip = headers["X-Forwarded-For"];
  if (isIPValid(ip)) {
    ip = headers["Proxy-Client-IP"];
  }
  if (isIPValid(ip)) {
    ip = headers["WL-Proxy-Client-IP"];
  }
  if (isIPValid(ip)) {
    ip = headers["HTTP_X_FORWARDED_FOR"];
  }
  if (isIPValid(ip)) {
    ip = headers["HTTP_X_FORWARDED"];
  }
  if (isIPValid(ip)) {
    ip = headers["HTTP_X_CLUSTER_CLIENT_IP"];
  }
  if (isIPValid(ip)) {
    ip = headers["HTTP_CLIENT_IP"];
  }
  if (isIPValid(ip)) {
    ip = headers["HTTP_FORWARDED_FOR"];
  }
  if (isIPValid(ip)) {
    ip = headers["HTTP_FORWARDED"];
  }
  if (isIPValid(ip)) {
    ip = headers["HTTP_VIA"];
  }
  if (isIPValid(ip)) {
    ip = headers["REMOTE_ADDR"];
  }
  if (isIPValid(ip)) {
    ip = socket.remoteAddress;
  }
  return ip;
};

const checkPassword = async (key, password, res) => {
  const user = await db.collection("user").get(key);
  if (!user) {
    res.status(401).json({ error: "User does not exist" });
    return true;
  }
  // check user password with hashed password stored in the database
  const validPassword = await bcrypt.compare(password, user.props.password);
  if (!validPassword) {
    res.status(400).json({ error: "Invalid Password" });
    return true;
  }
  return false;
};

module.exports = {
  getClientIpAddr,
  userCheck,
  createToken,
  checkPassword,
};
