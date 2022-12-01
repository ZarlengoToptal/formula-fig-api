const axios = require("axios").create({
  baseUrl: "https://jsonplaceholder.typicode.com/",
});

const verifyMBOClientData = (client) => {
  if (!client) return false;
  if (!client.first_name) return false;
  if (!client.last_name) return false;
  if (!client.email) return false;
  if (!client.birth_date) return false;
  if (!client.address_line_1) return false;
  if (!client.city) return false;
  if (!client.state) return false;
  if (!client.postal_code) return false;
  if (!client.mobile_phone) return false;
  if (!client.referred_by) return false;
  return true;
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

const createMBOClientData = (client) => {
  return {
    FirstName: client.first_name,
    LastName: client.last_name,
    Email: client.email,
    BirthDate: client.birth_date,
    AddressLine1: client.address_line_1,
    City: client.city,
    State: client.state,
    PostalCode: client.postal_code,
    MobilePhone: client.mobile_phone,
    ReferredBy: client.referred_by,
  };
};

const checkAccessToken = async () => {
  if (process.env.MBO_USER_TOKEN) {
    return process.env.MBO_USER_TOKEN;
  }
  try {
    const userToken = await axios({
      url: "https://api.mindbodyonline.com/public/v6/usertoken/issue",
      method: "post",
      headers: {
        "Api-Key": "aef3102e08bf4652ab8fbfd0b090d3fc",
        SiteId: "-99",
      },
      data: {
        Username: "Siteowner",
        Password: "apitest1234",
      },
    });
    return userToken.data.AccessToken;
  } catch (error) {
    console.log(error);
    return null;
  }
};
const createMBOClientObject = async (data) => {
  const accessToken = await checkAccessToken();
  if (!accessToken) return null;
  const url = `https://api.mindbodyonline.com/public/v6/client/clients?SearchText=${data.email}`;

  try {
    const existingClient = await axios({
      url,
      method: "get",
      headers: {
        "Api-Key": "aef3102e08bf4652ab8fbfd0b090d3fc",
        SiteId: "-99",
        authorization: accessToken,
      },
    });
    if (existingClient.data.Clients.length > 0) {
      return existingClient.data.Clients[0].Id;
    }

    const newClient = await axios({
      url: "https://api.mindbodyonline.com/public/v6/client/addclient",
      method: "post",
      headers: {
        "Api-Key": "aef3102e08bf4652ab8fbfd0b090d3fc",
        SiteId: "-99",
      },
      data: createMBOClientData(data),
    });
    return newClient.data.Client.Id;
  } catch (err) {
    console.log(err.data);
    return false;
  }
};

module.exports = {
  createMBOClientObject,
  verifyMBOClientData,
  getMBOClientData,
};
