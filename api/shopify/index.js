import { shopifyAxios } from "./utils.js";

const _createShopifyCustomerData = (customer) => {
  return {
    customer: {
      first_name: customer.first_name,
      last_name: customer.last_name,
      email: customer.email,
      // phone: `+${customer.mobile_phone}`,
      // addresses: [
      //   {
      //     address1: customer.address_line_1,
      //     city: customer.city,
      //     state: customer.state,
      //     phone: `+${customer.mobile_phone}`,
      //     zip: customer.postal_code,
      //     last_name: customer.last_name,
      //     first_name: customer.first_name,
      //     country: customer.country,
      //     default: true,
      //   },
      // ],
      send_email_welcome: false,
    },
  };
};

export const _getShopifyOrderData = async (orders) => {
  if (!orders || !orders.length) return [];
  const productIds = {};
  orders.map((order) =>
    order.line_items.map((item) => (productIds[item.product_id] = true))
  );
  const products = await _getProducts(Object.keys(productIds));
  return orders.map((order) => {
    const line_items =
      order.line_items.map((item) => {
        return {
          product_id: item.product_id || "",
          quantity: item.quantity || 0,
          name: item.name || "",
          price: item.price || "",
          fulfillment_status: item.fulfillment_status || "",
          image: _getImageFromProduct(products[item.product_id]) || {
            src: "",
            alt: "",
            width: 0,
            height: 0,
          },
        };
      }) || [];
    return {
      cancelled_at: order.cancelled_at || "",
      confirmed: order.confirmed || false,
      created_at: order.created_at || "",
      currency: order.currency || "",
      current_subtotal_price: order.current_subtotal_price || "",
      current_total_discounts: order.current_total_discounts || "",
      current_total_tax: order.current_total_tax || "",
      order_status_url: order.order_status_url || "",
      order_number: order.order_number || "",
      total_line_items_price: order.total_line_items_price || "",
      total_tax: order.total_tax || "",
      shipping_address: order.shipping_address || "",
      line_items,
    };
  });
};
/*
    shipped: Show orders that have been shipped. Returns orders with fulfillment_status of fulfilled.
    partial: Show partially shipped orders.
    unshipped: Show orders that have not yet been shipped. Returns orders with fulfillment_status of null.
    any: Show orders of any fulfillment status.
    unfulfilled: Returns orders with fulfillment_status of null or partial.
 */
const _getShopifyImageData = (image) => {
  return {
    src: image?.src || "",
    alt: image?.alt || "",
    width: image?.width || 0,
    height: image?.height || 0,
  };
};

const _getProducts = async (productIds) => {
  const { products } = await shopifyAxios("GET_PRODUCTS", {
    ids: productIds.join(","),
  });
  const results = {};

  products.map(
    (product) => (results[product.id] = _getShopifyImageData(product.image))
  );
  return results;
};

const _getImageFromProduct = (product) => {
  return {
    src: product?.src || "",
    alt: product?.alt || "",
    width: product?.width || 0,
    height: product?.height || 0,
  };
};

const verifyShopifyCustomerData = (customer) => {
  if (!customer) return false;
  if (!customer.first_name) return false;
  if (!customer.last_name) return false;
  if (!customer.email) return false;
  if (!customer.address_line_1) return false;
  if (!customer.city) return false;
  if (!customer.state) return false;
  if (!customer.postal_code) return false;
  if (!customer.mobile_phone) return false;
  if (!customer.country) return false;
  return true;
};
const getAllCustomers = async () => {
  if (process.env.debug) console.log("getAllCustomers");
  const { customers } = await shopifyAxios("GET_USERS");
  if (process.env.debug) console.log({ customers });
  return customers;
};

const getCustomerByEmail = async (email) => {
  if (process.env.debug) console.log("getCustomerByEmail", email);
  const { customers } = await shopifyAxios("GET_USERS_BY_QUERY", {
    query: `email:${email}`,
  });
  if (process.env.debug) console.log({ customers });
  return customers;
};

const addCustomer = async (customer) => {
  if (process.env.debug) console.log("addCustomer", customer);
  const { customer: newCustomer } = await shopifyAxios(
    "POST_ADD_CUSTOMER",
    _createShopifyCustomerData(customer)
  );
  if (process.env.debug) console.log({ newCustomer });
  return newCustomer.id;
};

const getShopifyCustomerObject = async (shopifyId) => {
  if (process.env.debug) console.log("getShopifyCustomerObject", shopifyId);
  const { orders } = await shopifyAxios("GET_CUSTOMER_ORDERS", shopifyId);
  if (process.env.debug) console.log({ orders });
  return await _getShopifyOrderData(orders);
};

export default {
  getAllCustomers,
  getCustomerByEmail,
  addCustomer,
  verifyShopifyCustomerData,
  getShopifyCustomerObject,
};
