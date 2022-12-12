import bcrypt from "bcrypt";

export const createApiObject = async (client, token, refresh_token) => {
  const salt = await bcrypt.genSalt(10);
  return {
    email: client.email,
    password: await bcrypt.hash(client.password, salt),
    token,
    refresh_token,
    "MBO_-99": client["MBO_-99"],
    shopifyCustomerId: client.shopifyCustomerId,
  };
};

export const verifyApiData = (client) => {
  if (!client) return false;
  if (!client.email) return false;
  if (!client.password) return false;
  return true;
};
