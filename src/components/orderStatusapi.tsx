export type OrderStatusResponse = {
  key: string;
  label: string;
};

export async function fetchOrderStatuses(orderType: string) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No auth token");

  const res = await fetch("http://bhojpe.in/api/v1/orderstatus", {
    method: "POST", // ✅ required for body
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      order_type: orderType,
    }),
  });

  const data = await res.json();
  if (!data.status) throw new Error(data.message);

  return data.data;
}


