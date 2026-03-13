import { BASE_URL } from "./api";

export const saveOrderApi = async (token: string, payload: any) => {
  debugger;
  const res = await fetch(`${BASE_URL}/saveOrder`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",

    },
    body: JSON.stringify(payload),
  });
console.log(res);
  return res.json();
};
