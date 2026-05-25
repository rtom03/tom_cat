import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generateApp } from "../services/appServices";

export const useGenerateApp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateApp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] }); // refreshes the jobs list
    },
  });
};
