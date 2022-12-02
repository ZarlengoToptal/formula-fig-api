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

const getMBOVisitsData = async (visits) => {
  const locations = await getLocations();
  const allVisits = visits.map((visit) => {
    return {
      ClassId: visit.ClassId,
      StartDate: visit.StartDateTime,
      EndDate: visit.EndDateTime,
      SiteId: visit.SiteId,
      Location: locations[visit.LocationId],
      Name: visit.Name,
    };
  });
  return {
    Appointments: allVisits.filter(
      (visit) => new Date(visit.StartDate) >= new Date()
    ),
    History: allVisits.filter(
      (visit) => new Date(visit.StartDate) < new Date()
    ),
  };
};

const getMBOClientData = (client, memberships) => {
  console.log("getMBOClientData");
  console.log({ memberships });
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
        console.log({ membership });
        return {
          Name: membership.Name,
          ActiveDate: membership.ActiveDate,
          ExpirationDate: membership.ExpirationDate,
          Remaining: membership.Remaining,
        };
      }) || [],
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

const createMBOClassScheduleData = async (classes) => {
  const locations = await getLocations();
  return classes.map((classData) => {
    return {
      ClassId: classData.Id,
      MaxCapacity: classData.MaxCapacity,
      TotalBooked: classData.TotalBooked,
      StartDateTime: classData.StartDateTime,
      EndDateTime: classData.EndDateTime,
      Location: locations[classData.Location.Id],
      Name: classData.ClassDescription.Name,
    };
  });
};

const createMBOLocationData = (rawLocations) => {
  const locations = {};
  rawLocations.forEach((location) => (locations[location.Id] = location.Name));
  return locations;
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

const getLocations = async () => {
  if (process.env.MBO_LOCATIONS) {
    return JSON.parse(process.env.MBO_LOCATIONS);
  }

  try {
    const locations = await axios({
      url: "https://api.mindbodyonline.com/public/v6/site/locations",
      method: "get",
      headers: {
        "Api-Key": "aef3102e08bf4652ab8fbfd0b090d3fc",
        SiteId: "-99",
      },
    });
    process.env.MBO_LOCATIONS = JSON.stringify(
      createMBOLocationData(locations.data.Locations)
    );
    return JSON.parse(process.env.MBO_LOCATIONS);
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getMBOClientVisits = async (clientId) => {
  const oneYear = 365 * 24 * 60 * 60 * 1000;
  const startDate = new Date(new Date().getTime() - oneYear).toISOString();
  const endDate = new Date(new Date().getTime() + oneYear).toISOString();
  const accessToken = await checkAccessToken();
  if (!accessToken) return null;
  const url = `https://api.mindbodyonline.com/public/v6/client/clientvisits?ClientId=${clientId}&StartDate=${startDate}&EndDate=${endDate}`;
  try {
    const client = await axios({
      url,
      method: "get",
      headers: {
        "Api-Key": "aef3102e08bf4652ab8fbfd0b090d3fc",
        SiteId: "-99",
        authorization: accessToken,
      },
    });
    if (client?.data?.Visits) {
      return await getMBOVisitsData(client.data.Visits);
    }
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

const removeClientFromClass = async (ClientId, ClassId) => {
  const accessToken = await checkAccessToken();
  if (!accessToken) return null;

  try {
    const { data } = await axios({
      url: "https://api.mindbodyonline.com/public/v6/class/removeclientfromclass",
      method: "post",
      headers: {
        "Api-Key": "aef3102e08bf4652ab8fbfd0b090d3fc",
        SiteId: "-99",
        authorization: accessToken,
      },
      data: { ClientId, ClassId },
    });
    console.log({ data });
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const addClientToClass = async (ClientId, ClassId) => {
  const accessToken = await checkAccessToken();
  if (!accessToken) return null;

  try {
    const { data } = await axios({
      url: "https://api.mindbodyonline.com/public/v6/class/addclienttoclass",
      method: "post",
      headers: {
        "Api-Key": "aef3102e08bf4652ab8fbfd0b090d3fc",
        SiteId: "-99",
        authorization: accessToken,
      },
      data: { ClientId, ClassId },
    });
    console.log({ data });
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getClassReschedule = async (ClassId) => {
  const accessToken = await checkAccessToken();
  if (!accessToken) return null;
  try {
    const endDate = new Date(new Date().getTime() + 21 * 24 * 60 * 60 * 1000);
    const scheduleUrl = `https://api.mindbodyonline.com/public/v6/class/classes?ClassIds=${ClassId}&EndDateTime=${endDate.toISOString()}`;
    const { data } = await axios({
      url: scheduleUrl,
      method: "get",
      headers: {
        "Api-Key": "aef3102e08bf4652ab8fbfd0b090d3fc",
        SiteId: "-99",
      },
    });
    const classScheduleId = data.Classes[0].ClassScheduleId;

    const url = `https://api.mindbodyonline.com/public/v6/class/classes?classScheduleIds=${classScheduleId}&EndDateTime=${endDate.toISOString()}`;
    const { data: allClasses } = await axios({
      url,
      method: "get",
      headers: {
        "Api-Key": "aef3102e08bf4652ab8fbfd0b090d3fc",
        SiteId: "-99",
      },
    });
    return await createMBOClassScheduleData(allClasses.Classes);
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getMBOClientObject = async (mboId) => {
  const accessToken = await checkAccessToken();
  if (!accessToken) return null;
  console.log("getMBOClientObject", mboId, accessToken);
  const options = {
    url: `https://api.mindbodyonline.com/public/v6/client/clientcompleteinfo?ClientId=${mboId}`,
    method: "get",
    headers: {
      "Api-Key": "aef3102e08bf4652ab8fbfd0b090d3fc",
      SiteId: "-99",
      authorization: accessToken,
    },
  };
  console.log({ options });
  try {
    const { data } = await axios(options);
    return getMBOClientData(data.Client, data.ClientMemberships);
  } catch (err) {
    // console.log(err);
    return false;
  }
};

module.exports = {
  createMBOClientObject,
  verifyMBOClientData,
  getMBOClientData,
  getMBOClientVisits,
  getLocations,
  removeClientFromClass,
  addClientToClass,
  getClassReschedule,
  getMBOClientObject,
};
