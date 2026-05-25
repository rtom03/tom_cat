import { useQuery } from "@tanstack/react-query";
import { getJobs } from "../services/appServices";
import type { Job } from "../tabs/ApplicationTab";

type JobsResponse = Job[]; // it's just an array, no wrapper object

export const useGetJobs = () => {
  return useQuery<JobsResponse>({
    queryKey: ["jobs"],
    queryFn: getJobs,
  });
};
