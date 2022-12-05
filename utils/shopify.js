// Construct the Multipassify encoder
import Multipassify from "multipassify";
const multipassify = new Multipassify(process.env.MULTIPASS_SECRET);
const shopifyStoreURL = `${process.env.SHOPIFY_STORE_NAME}.myshopify.com`;

const createShopifyClientData = (client) => {
  return {
    email: client.email,
    created_at: Date.now(),
    return_to: client.return_to || "http://yourstore.com/some_specific_site",

    first_name: client.first_name,
    last_name: client.last_name,

    addresses: [
      {
        address1: client.address_line_1,
        city: client.city,
        country: client.country,
        first_name: client.first_name,
        last_name: client.last_name,
        phone: client.mobile_phone,
        state: client.state,
        zip: client.postal_code,
        default: true,
      },
    ],
  };
};

export const createMultipassToken = async (client) => {
  // Generate a Shopify multipass URL to your shop
  return multipassify.generateUrl(
    createShopifyClientData(client),
    shopifyStoreURL
  );
};
