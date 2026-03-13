export const BASE_URL = import.meta.env.DEV
  ? "/api/v1"
  : "http://bhojpe.in/api/v1";

export const API_ENDPOINTS = {
  LOGIN: `${BASE_URL}/login`,
  LOGOUT: `${BASE_URL}/logout`,
  ORDERS: `${BASE_URL}/orders`,
  ITEMS: `${BASE_URL}/items`,
};

