import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCustomersApi, saveCustomerApi } from "../../api/endpoints/customers";

type CustomerParams = { restaurant_id: number; branch_id: number; search?: string; page?: number; per_page?: number };

export const useCustomersQuery = (params: CustomerParams, enabled = true) =>
  useQuery({
    queryKey: ["customers", params],
    queryFn: () => fetchCustomersApi(params).then((r) => r.data),
    staleTime: 1000 * 60 * 3,
    enabled: enabled && Boolean(params.restaurant_id) && Boolean(params.branch_id) && Boolean(localStorage.getItem("token")),
    placeholderData: (prev) => prev,
  });

export const useSaveCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveCustomerApi,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["customers"] }); },
  });
};
