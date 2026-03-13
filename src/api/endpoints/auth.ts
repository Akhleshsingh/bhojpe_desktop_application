import client from "../client";

export const loginApi = (email: string, password: string) =>
  client.post("/login", { email, password });

export const logoutApi = () => client.post("/logout");

export const fetchBranchDataApi = () => client.get("/branch-master-data");
