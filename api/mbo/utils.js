import axios from "axios";
const baseUrl = "https://api.mindbodyonline.com/public/v6";
const URL_LIST = {
  GET_USER_TOKEN: {
    URL: "/usertoken/issue",
    METHOD: "POST",
    AUTH: false,
  },
  GET_LOCATIONS: {
    URL: "/site/locations",
    METHOD: "GET",
    AUTH: false,
  },
  GET_CLIENT_COMPLETE: {
    URL: "/client/clientcompleteinfo",
    METHOD: "GET",
    AUTH: true,
  },
  GET_CLIENT_VISITS: {
    URL: "/client/clientvisits",
    METHOD: "GET",
    AUTH: true,
  },
  GET_CLIENTS: {
    URL: "/client/clients",
    METHOD: "GET",
    AUTH: true,
  },
  UPDATE_CLIENT: {
    URL: "/client/updateclient",
    METHOD: "POST",
    AUTH: true,
  },
  GET_CLASSES: {
    URL: "/class/classes",
    METHOD: "GET",
    AUTH: false,
  },
  POST_ADD_CLIENT_TO_CLASS: {
    URL: "/class/addclienttoclass",
    METHOD: "POST",
    AUTH: true,
  },
  POST_REMOVE_CLIENT_FROM_CLASS: {
    URL: "/class/removeclientfromclass",
    METHOD: "POST",
    AUTH: true,
  },
  POST_ADD_CLIENT: {
    URL: "/client/addclient",
    METHOD: "POST",
    AUTH: false,
  },
};

export const mboAxios = async (URL_TOKEN, data = null) => {
  const URL = URL_LIST[URL_TOKEN];
  const headers = {
    "Api-Key": process.env.MBO_API_KEY,
    SiteId: process.env.MBO_SITE_ID,
    "Accept-Encoding": "application/json",
  };
  if (URL.AUTH) {
    const accessToken = await _checkAccessToken();
    if (!accessToken) return null;
    headers["authorization"] = accessToken;
  }
  let url = `${baseUrl}${URL.URL}`;
  if (URL.METHOD === "GET") {
    const searchParams = new URLSearchParams(data);
    url = `${url}?${searchParams.toString()}`;
    data = null;
  }
  const options = {
    url,
    method: URL.METHOD,
    headers,
    data,
  };
  if (process.env.debug) console.log({ options });
  return axios(options)
    .then((response) => {
      if (process.env.debug) console.log({ response: response.data });
      return response.data;
    })
    .catch((error) => {
      console.log(error);
      return null;
    });
};

const _checkAccessToken = async () => {
  if (process.env.MBO_USER_TOKEN) {
    return process.env.MBO_USER_TOKEN;
  }
  if (process.env.debug) console.log("getAccessToken");
  try {
    const { AccessToken } = await mboAxios("GET_USER_TOKEN", {
      Username: process.env.MBO_API_USERNAME,
      Password: process.env.MBO_API_PASSWORD,
    });
    process.env.MBO_USER_TOKEN = AccessToken;
    return AccessToken;
  } catch (error) {
    console.log(error);
    return null;
  }
};
