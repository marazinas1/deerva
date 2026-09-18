import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteStandardDraft,
  getStandardsLibrary,
  listProjectStandardAssignments,
  listStandardDrafts,
  saveProjectStandardAssignment,
  saveStandardDraft,
} from "@/lib/standards.functions";

export function useStandardsLibrary() {
  return useQuery({ queryKey: ["admin", "standards", "library"], queryFn: () => getStandardsLibrary() });
}

export function useStandardDrafts() {
  return useQuery({ queryKey: ["admin", "standards", "drafts"], queryFn: () => listStandardDrafts() });
}

export function useProjectStandardAssignments() {
  return useQuery({ queryKey: ["admin", "standards", "coverage"], queryFn: () => listProjectStandardAssignments() });
}

export function useSaveStandardDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof saveStandardDraft>[0]["data"]) => saveStandardDraft({ data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "standards", "drafts"] }),
  });
}

export function useDeleteStandardDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteStandardDraft({ data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "standards", "drafts"] }),
  });
}

export function useSaveProjectStandardAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof saveProjectStandardAssignment>[0]["data"]) => saveProjectStandardAssignment({ data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "standards", "coverage"] }),
  });
}