import client from "../client";

export type OrdersParams = {
  page?: number;
  per_page?: number;
  order_status?: string;
  order_type?: string;
  delivery_platform?: string;
  waiter_id?: string | number;
  from_date?: string;
  to_date?: string;
  search?: string;
};

export const fetchOrdersApi = (params: OrdersParams = {}) => {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.per_page) query.set("per_page", String(params.per_page));
  if (params.order_status) query.set("order_status", params.order_status);
  if (params.order_type) query.set("order_type", params.order_type);
  if (params.delivery_platform) query.set("delivery_platform", params.delivery_platform);
  if (params.waiter_id) query.set("waiter_id", String(params.waiter_id));
  if (params.from_date) query.set("from_date", params.from_date);
  if (params.to_date) query.set("to_date", params.to_date);
  if (params.search) query.set("search", params.search);
  return client.get(`/orders?${query.toString()}`);
};

export const saveOrderApi = (payload: any) =>
  client.post("/saveOrder", payload);

export const updateOrderStatusApi = (payload: {
  order_id: number;
  status: string;
  [key: string]: any;
}) => client.post("/updateorderStatus", payload);

export const updateOrderPaymentApi = (payload: any) =>
  client.post("/update-order-payment", payload);

export const applyDiscountApi = (payload: any) =>
  client.post("/applydiscount", payload);

export const fetchOrderStatusApi = () => client.get("/orderstatus");
