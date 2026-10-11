import { useQuery } from "@tanstack/react-query";
import { api } from "./mock";

/** Query hooks wrapping the mock API. At integration time, only mock.ts changes — these stay. */
export const useProfile = () => useQuery({ queryKey: ["profile"], queryFn: api.getProfile });
export const useEnquiries = () => useQuery({ queryKey: ["enquiries"], queryFn: api.getEnquiries });
export const useEnquiry = (id: string) =>
  useQuery({ queryKey: ["enquiry", id], queryFn: () => api.getEnquiry(id) });
export const useProjects = () => useQuery({ queryKey: ["projects"], queryFn: api.getProjects });
export const useProject = (id: string) =>
  useQuery({ queryKey: ["project", id], queryFn: () => api.getProject(id) });
export const useProperties = () => useQuery({ queryKey: ["properties"], queryFn: api.getProperties });
export const usePropertiesByProject = (projectId: string) =>
  useQuery({ queryKey: ["properties", projectId], queryFn: () => api.getPropertiesByProject(projectId) });
