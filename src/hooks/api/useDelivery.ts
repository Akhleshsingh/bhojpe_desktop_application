import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchDeliveryExecutivesApi, fetchWaitersApi, fetchWaiterRequestsApi, fetchReservationsApi, updateDeliveryExecStatusApi } from "../../api/endpoints/delivery";

export const useDeliveryExecutives = () =>
  useQuery({
    queryKey: ["deliveryExecutives"],
    queryFn: () => fetchDeliveryExecutivesApi().then((r) => r.data),
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
    refetchOnReconnect: true,
    enabled: Boolean(localStorage.getItem("token")),
  });

export const useUpdateDeliveryExecStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      updateDeliveryExecStatusApi(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["deliveryExecutives"] }); },
  });
};

export const useWaitersQuery = () =>
  useQuery({
    queryKey: ["waiters"],
    queryFn: () => fetchWaitersApi().then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    enabled: Boolean(localStorage.getItem("token")),
  });

export const useWaiterRequestsQuery = () =>
  useQuery({
    queryKey: ["waiterRequests"],
    queryFn: () => fetchWaiterRequestsApi().then((r) => r.data),
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 30,
    refetchOnReconnect: true,
    enabled: Boolean(localStorage.getItem("token")),
  });

export const useReservationsQuery = () =>
  useQuery({
    queryKey: ["reservations"],
    queryFn: () => fetchReservationsApi().then((r) => r.data),
    staleTime: 1000 * 60 * 2,
    refetchOnReconnect: true,
    enabled: Boolean(localStorage.getItem("token")),
  });
