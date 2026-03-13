import client from "../client";

export const fetchCustomersApi = (params: {
  restaurant_id: number;
  branch_id: number;
  search?: string;
  page?: number;
  per_page?: number;
}) => {
  const query = new URLSearchParams();
  query.set("restaurant_id", String(params.restaurant_id));
  query.set("branch_id", String(params.branch_id));
  if (params.search) query.set("search", params.search);
  if (params.page) query.set("page", String(params.page));
  if (params.per_page) query.set("per_page", String(params.per_page));
  return client.get(`/getuser?${query.toString()}`);
};

export const saveCustomerApi = (payload: {
  name: string;
  phone: string;
  email?: string;
  restaurant_id: number;
  branch_id: number;
}) => client.post("/adduser", payload);
