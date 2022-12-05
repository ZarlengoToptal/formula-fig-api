import axios from "axios";
const baseUrl = "https://formula-fig-staging.myshopify.com";
const URL_LIST = {
  GET_USERS: {
    URL: "/admin/api/2022-04/customers.json",
    METHOD: "GET",
  },
  GET_USERS_BY_QUERY: {
    URL: "/admin/api/2022-10/customers/search.json",
    METHOD: "GET",
  },
  POST_ADD_CUSTOMER: {
    URL: "/admin/api/2022-10/customers.json",
    METHOD: "POST",
  },
  GET_CUSTOMER_ORDERS: {
    URL: (customerId) =>
      `/admin/api/2022-10/customers/${customerId}/orders.json`,
    METHOD: "GET",
  },
  GET_PRODUCTS: {
    URL: "/admin/api/2022-10/products.json",
    METHOD: "GET",
  },
};

export const shopifyAxios = async (URL_TOKEN, data = null) => {
  const URL = URL_LIST[URL_TOKEN];
  let url;
  if (typeof URL.URL === "function") {
    url = `${baseUrl}${URL.URL(data)}`;
    data = null;
  } else if (URL.METHOD === "GET") {
    const searchParams = new URLSearchParams(data);
    url = `${baseUrl}${URL.URL}?${searchParams.toString()}`;
    data = null;
  } else {
    url = `${baseUrl}${URL.URL}`;
  }
  const headers = {
    "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_API_KEY,
  };
  const options = {
    url,
    method: URL.METHOD,
    headers,
    data,
  };
  // console.log({ options });
  return axios(options)
    .then((response) => response.data)
    .catch((error) => {
      console.log(error);
      return null;
    });
};
