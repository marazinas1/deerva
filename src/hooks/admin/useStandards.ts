import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteStandardDraft,
  getStandardsLibrary,
  listProjectStandardAssignments,
  listStandardDrafts,
  saveProjectStandardAssignment,
  saveStandardDraft,
} from "@/lib/standards.functions";

type DraftInput = {
  id?: string;
  target_kind: "standard" | "skill" | "document";
  target_slug: string;
  title: string;
  reason: string;
  content: string;
  base_revision: string;
  status: "draft" | "ready" | "implemented" | "archived";
};

type AssignmentInput = {
  client_id: string;
  standard_slug: string;
  applied_revision: string;
  status: "compliant" | "review_needed" | "exception" | "not_applicable";
  notes: string;
};

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
    mutationFn: (data: DraftInput) => saveStandardDraft({ data }),
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
    mutationFn: (data: AssignmentInput) => saveProjectStandardAssignment({ data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "standards", "coverage"] }),
  });
}