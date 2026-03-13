import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchOrdersApi, updateOrderStatusApi, updateOrderPaymentApi, applyDiscountApi, type OrdersParams } from "../../api/endpoints/orders";

export const useOrdersQuery = (params: OrdersParams = {}, enabled = true) =>
  useQuery({
    queryKey: ["orders", params],
    queryFn: () => fetchOrdersApi(params).then((r) => r.data),
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 30,
    refetchOnReconnect: true,
    enabled: enabled && Boolean(localStorage.getItem("token")),
  });

export const useUpdateOrderStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateOrderStatusApi,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["orders"] }); },
  });
};

export const useUpdateOrderPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateOrderPaymentApi,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["orders"] }); },
  });
};

export const useApplyDiscount = () =>
  useMutation({ mutationFn: applyDiscountApi });
