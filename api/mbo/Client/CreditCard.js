import { mboAxios } from "../utils.js";

const _getMboCCData = ({ ClientCreditCard }) => {
  return {
    Address: ClientCreditCard?.Address || "",
    CardHolder: ClientCreditCard?.CardHolder || "",
    City: ClientCreditCard?.City || "",
    ExpMonth: ClientCreditCard?.ExpMonth || "",
    ExpYear: ClientCreditCard?.ExpYear || "",
    LastFour: ClientCreditCard?.LastFour || "",
    PostalCode: ClientCreditCard?.PostalCode || "",
    State: ClientCreditCard?.State || "",
  };
};

export default {
  get: async (mboId) => {
    if (process.env.debug) console.log("get", mboId);
    const { Client } = await mboAxios("GET_CLIENT_COMPLETE", {
      ClientId: mboId,
    });
    if (process.env.debug) console.log({ Client });
    return _getMboCCData(Client);
  },
  update: async (mboId, ccData) => {
    if (process.env.debug) console.log("update", mboId);
    await mboAxios("UPDATE_CLIENT", {
      Client: {
        Id: mboId,
        ClientCreditCard: ccData,
      },
      CrossRegionalUpdate: false,
    });
    return true;
  },
  delete: async (mboId) => {
    if (process.env.debug) console.log("delete", mboId);
    await mboAxios("UPDATE_CLIENT", {
      Client: {
        Id: mboId,
        ClientCreditCard: {
          CardNumber: "",
          ExpMonth: "",
          ExpYear: "",
          CardHolder: "",
        },
      },
      CrossRegionalUpdate: false,
    });
    return true;
  },
};
