import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteJobs, generateApp, updateJobApp } from "../services/appServices";

export const useGenerateApp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateApp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] }); // refreshes the jobs list
    },
  });
};

export const useUpdateJobApp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateJobApp,

    onSuccess: () => {
      // refetch jobs after update
      queryClient.invalidateQueries({
        queryKey: ["jobs"],
      });
    },
  });
};

// hooks/useDeleteJob.ts

export const useDeleteJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteJobs,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["jobs"],
      });
    },
  });
};
