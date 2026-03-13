import { useQuery } from "@tanstack/react-query";
import { fetchBranchMasterDataApi, fetchHomeDashboardApi, fetchMenuItemsApi, fetchRolesApi } from "../../api/endpoints/branch";

export const useBranchData = () =>
  useQuery({
    queryKey: ["branchData"],
    queryFn: () => fetchBranchMasterDataApi().then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    enabled: Boolean(localStorage.getItem("token")),
  });

export const useHomeDashboard = () =>
  useQuery({
    queryKey: ["homeDashboard"],
    queryFn: () => fetchHomeDashboardApi().then((r) => r.data),
    staleTime: 1000 * 60 * 1,
    refetchInterval: 1000 * 60 * 2,
    enabled: Boolean(localStorage.getItem("token")),
  });

export const useMenuItems = () =>
  useQuery({
    queryKey: ["menuItems"],
    queryFn: () => fetchMenuItemsApi().then((r) => r.data),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    enabled: Boolean(localStorage.getItem("token")),
  });

export const useRoles = () =>
  useQuery({
    queryKey: ["roles"],
    queryFn: () => fetchRolesApi().then((r) => r.data),
    staleTime: 1000 * 60 * 30,
    enabled: Boolean(localStorage.getItem("token")),
  });
