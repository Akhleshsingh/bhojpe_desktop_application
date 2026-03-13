import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchStaffApi, addStaffApi, updateStaffApi, deleteStaffApi } from "../../api/endpoints/staff";

type StaffParams = { restaurant_id: number; branch_id: number };

export const useStaffQuery = (params: StaffParams, enabled = true) =>
  useQuery({
    queryKey: ["staff", params],
    queryFn: () => fetchStaffApi(params).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    enabled: enabled && Boolean(params.restaurant_id) && Boolean(params.branch_id) && Boolean(localStorage.getItem("token")),
  });

export const useAddStaff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addStaffApi,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["staff"] }); },
  });
};

export const useUpdateStaff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => updateStaffApi(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["staff"] }); },
  });
};

export const useDeleteStaff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteStaffApi,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["staff"] }); },
  });
};
