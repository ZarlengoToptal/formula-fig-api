const bcrypt = require("bcrypt");

const createApiObject = async (client, token, refresh_token) => {
  const salt = await bcrypt.genSalt(10);
  return {
    email: client.email,
    password: await bcrypt.hash(client.password, salt),
    token,
    refresh_token,
    "MBO_-99": client["MBO_-99"],
  };
};

const verifyApiData = (client) => {
  if (!client) return false;
  if (!client.email) return false;
  if (!client.password) return false;
  return true;
};

module.exports = {
  createApiObject,
  verifyApiData,
};
