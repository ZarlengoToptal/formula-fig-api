import CreditCard from "./CreditCard.js";
import Visits from "./Visits.js";
import { mboAxios } from "../utils.js";

const _createMBOClientData = (client) => {
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

const _updateMBOClientData = (client) => {
  const clientDate = {};
  if (client.FirstName) clientDate.FirstName = client.FirstName;
  if (client.LastName) clientDate.LastName = client.LastName;
  if (client.Email) clientDate.Email = client.Email;
  if (client.BirthYear)
    clientDate.BirthDate = `${client.BirthYear}-${client.BirthMonth}-${client.BirthDay}`;
  if (client.AddressLine1) clientDate.AddressLine1 = client.AddressLine1;
  if (client.City) clientDate.City = client.City;
  if (client.State) clientDate.State = client.State;
  if (client.PostalCode) clientDate.PostalCode = client.PostalCode;
  if (client.MobilePhone) clientDate.MobilePhone = client.MobilePhone;
  if (client.Country) clientDate.Country = client.Country;
  if (client.Location) clientDate.HomeLocation = { Id: client.Location };
  if (client.SendAccountEmails)
    clientDate.SendAccountEmails = client.SendAccountEmails;
  if (client.SendAccountTexts)
    clientDate.SendAccountTexts = client.SendAccountTexts;
  if (client.SendPromotionalEmails)
    clientDate.SendPromotionalEmails = client.SendPromotionalEmails;
  if (client.SendPromotionalTexts)
    clientDate.SendPromotionalTexts = client.SendPromotionalTexts;
  if (client.SendScheduleEmails)
    clientDate.SendScheduleEmails = client.SendScheduleEmails;
  if (client.SendScheduleTexts)
    clientDate.SendScheduleTexts = client.SendScheduleTexts;
  return clientDate;
};
export const _getMBOClientData = (client, memberships) => {
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
    HomeLocationId: client.HomeLocation?.Id || "",
    ClientCreditCard: {
      CardType: client.ClientCreditCard?.CardType || "",
      ExpMonth: client.ClientCreditCard?.ExpMonth || "",
      ExpYear: client.ClientCreditCard?.ExpYear || "",
      LastFour: client.ClientCreditCard?.LastFour || "",
      CardHolder: client.ClientCreditCard?.CardHolder || "",
    },
    // ClientServices: client.ClientServices || "",
    Membership:
      memberships.map((membership) => {
        return {
          Name: membership.Name,
          ActiveDate: membership.ActiveDate,
          ExpirationDate: membership.ExpirationDate,
          Remaining: membership.Remaining,
        };
      }) || [],
  };
};

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

const getMBOClientObject = async (mboId) => {
  if (process.env.debug) console.log("getMBOClientObject", mboId);
  const { Client, ClientMemberships } = await mboAxios("GET_CLIENT_COMPLETE", {
    ClientId: mboId,
  });
  if (process.env.debug) console.log({ Client });
  return _getMBOClientData(Client, ClientMemberships);
};
const findByEmail = async (email) => {
  if (process.env.debug) console.log("findByEmail", email);
  const { Clients } = await mboAxios("GET_CLIENTS", {
    SearchText: email,
  });
  if (process.env.debug) console.log({ Clients });
  return Clients;
};
const addClient = async (data) => {
  if (process.env.debug) console.log("addClient", data);
  const { Client } = await mboAxios(
    "POST_ADD_CLIENT",
    _createMBOClientData(data)
  );
  if (process.env.debug) console.log({ Client });
  return Client.Id;
};

const updateMBOClientObject = async (mboId, data) => {
  if (process.env.debug) console.log("updateMBOClientObject", mboId);
  await mboAxios("UPDATE_CLIENT", {
    Client: {
      Id: mboId,
      ..._updateMBOClientData(data),
    },
    CrossRegionalUpdate: false,
  });
  return true;
};

export default {
  getMBOClientObject,
  updateMBOClientObject,
  findByEmail,
  addClient,
  verifyMBOClientData,
  CreditCard,
  Visits,
};
