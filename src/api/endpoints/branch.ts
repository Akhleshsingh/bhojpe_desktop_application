import client from "../client";

export const fetchBranchMasterDataApi = () =>
  client.get("/branch-master-data");

export const fetchHomeDashboardApi = () =>
  client.get("/home-dashboard");

export const fetchMenuItemsApi = () => client.get("/menu-items");

export const fetchRolesApi = () => client.get("/restaurant-roles");
