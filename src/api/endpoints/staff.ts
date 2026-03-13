import client from "../client";

export const fetchStaffApi = (params: {
  restaurant_id: number;
  branch_id: number;
}) => client.get(`/getstaffs?restaurant_id=${params.restaurant_id}&branch_id=${params.branch_id}`);

export const addStaffApi = (payload: any) =>
  client.post("/add-staff", payload);

export const updateStaffApi = (id: number, payload: any) =>
  client.post(`/update-staff/${id}`, payload);

export const deleteStaffApi = (id: number) =>
  client.delete(`/delete-staff/${id}`);
