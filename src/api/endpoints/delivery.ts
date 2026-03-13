import client from "../client";

export const fetchDeliveryExecutivesApi = () =>
  client.get("/delivery-executives");

export const updateDeliveryExecStatusApi = (id: number, status: string) =>
  client.post("/update-delivery-executive", { id, status });

export const fetchWaitersApi = () => client.get("/getwaiters");

export const fetchWaiterRequestsApi = () => client.get("/waiter-requests");

export const fetchReservationsApi = () => client.get("/reservations");
