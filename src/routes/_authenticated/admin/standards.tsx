import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, FileText, LibraryBig, Plus, Search, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { AdminTabs, AdminTabsContent, AdminTabsList, AdminTabsTrigger } from "@/components/admin/AdminTabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useFinanceClients } from "@/hooks/admin/useFinance";
import {
  useDeleteStandardDraft,
  useProjectStandardAssignments,
  useSaveProjectStandardAssignment,
  useSaveStandardDraft,
  useStandardDrafts,
  useStandardsLibrary,
} from "@/hooks/admin/useStandards";
import { getAdminMe } from "@/lib/admin.functions";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/admin/standards")({
  head: () => ({
    meta: [
      { title: "Standards Library | Deerva" },
      { name: "description", content: "Internal Deerva standards, Skills, project coverage and drafts." },
      { property: "og:title", content: "Standards Library | Deerva" },
      { property: "og:description", content: "Internal Deerva standards, Skills, project coverage and drafts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StandardsPage,
});

type Tab = "library" | "skills" | "coverage" | "drafts";
type DraftStatus = "draft" | "ready" | "implemented" | "archived";
type CoverageStatus = "compliant" | "review_needed" | "exception" | "not_applicable";

const COVERAGE_LABELS: Record<CoverageStatus, string> = {
  compliant: "Compliant",
  review_needed: "Review needed",
  exception: "Exception",
  not_applicable: "Not applicable",
};

function StandardsPage() {
  const [tab, setTab] = useState<Tab>("library");
  const [search, setSearch] = useState("");
  const [draftOpen, setDraftOpen] = useState(false);
  const library = useStandardsLibrary();
  const drafts = useStandardDrafts();
  const assignments = useProjectStandardAssignments();
  const clients = useFinanceClients();
  const me = useQuery({ queryKey: ["admin", "me"], queryFn: () => getAdminMe() });
  const canWrite = Boolean(me.data?.isManager);

  const documents = library.data ?? [];
  const standards = documents.filter((document) => document.kind === "standard");
  const skills = documents.filter((document) => document.kind === "skill");
  const needle = search.trim().toLowerCase();
  const filteredDocuments = documents.filter((document) =>
    document.kind !== "skill" && (!needle || `${document.title} ${document.description} ${document.category}`.toLowerCase().includes(needle)),
  );

  return (
    <div className="w-full space-y-8">
      <AdminPageHeader
        title="Standards"
        description="The working library for how Deerva projects are designed, built and maintained."
        action={canWrite ? <Button onClick={() => setDraftOpen(true)}><Plus className="h-4 w-4" />New draft</Button> : undefined}
      />

      <AdminTabs value={tab} onValueChange={(value) => setTab(value as Tab)}>
        <AdminTabsList className="grid-cols-4">
          <AdminTabsTrigger value="library">Library</AdminTabsTrigger>
          <AdminTabsTrigger value="skills">Skills</AdminTabsTrigger>
          <AdminTabsTrigger value="coverage">Project coverage</AdminTabsTrigger>
          <AdminTabsTrigger value="drafts">Drafts</AdminTabsTrigger>
        </AdminTabsList>

        <AdminTabsContent value="library" className="mt-6 space-y-6">
          <SearchField value={search} onChange={setSearch} placeholder="Search standards and documents" />
          {library.isLoading ? <LoadingRows /> : library.error ? <ErrorState retry={() => library.refetch()} /> : filteredDocuments.length === 0 ? (
            <EmptyState text="No documents match this search." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredDocuments.map((document) => <DocumentCard key={document.slug} document={document} />)}
            </div>
          )}
        </AdminTabsContent>

        <AdminTabsContent value="skills" className="mt-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">Active instructions paired with their written source standard.</p>
            <Badge variant="outline">{skills.length} active</Badge>
          </div>
          {library.isLoading ? <LoadingRows /> : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {skills.map((skill) => {
                const source = standards.find((standard) => standard.slug === skill.standardSlug);
                return (
                  <DocumentCard key={skill.slug} document={skill} footer={
                    source ? <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Check className="h-3.5 w-3.5 text-success" />Linked to {source.title}</span> : <span className="text-xs text-warning">No source standard linked</span>
                  } />
                );
              })}
            </div>
          )}
        </AdminTabsContent>

        <AdminTabsContent value="coverage" className="mt-6">
          <CoverageTable
            standards={standards}
            clients={clients.data ?? []}
            assignments={assignments.data ?? []}
            loading={library.isLoading || clients.isLoading || assignments.isLoading}
            canWrite={canWrite}
          />
        </AdminTabsContent>

        <AdminTabsContent value="drafts" className="mt-6">
          <DraftList drafts={drafts.data ?? []} documents={documents} loading={drafts.isLoading} canWrite={canWrite} onNew={() => setDraftOpen(true)} />
        </AdminTabsContent>
      </AdminTabs>

      <DraftDialog open={draftOpen} onOpenChange={setDraftOpen} documents={documents} />
    </div>
  );
}

function SearchField({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return <div className="relative max-w-md"><Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input aria-label={placeholder} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="pl-9" /></div>;
}

function DocumentCard({ document, footer }: { document: { slug: string; title: string; description: string; category: string; kind: string; revision: string }; footer?: React.ReactNode }) {
  return (
    <Link to="/admin/standards/$slug" params={{ slug: document.slug }} className="flex min-h-48 cursor-pointer flex-col rounded-lg border border-border bg-card p-5 transition-colors hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <div className="flex items-start justify-between gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">{document.kind === "standard" ? <ShieldCheck className="h-4 w-4" /> : document.kind === "skill" ? <LibraryBig className="h-4 w-4" /> : <FileText className="h-4 w-4" />}</div><Badge variant="outline">{document.category}</Badge></div>
      <h2 className="mt-5 font-semibold text-foreground">{document.title}</h2>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">{document.description}</p>
      <div className="mt-5 border-t border-border pt-3">{footer ?? <span className="font-mono text-xs text-muted-foreground">rev {document.revision}</span>}</div>
    </Link>
  );
}

function CoverageTable({ standards, clients, assignments, loading, canWrite }: { standards: { slug: string; title: string; revision: string }[]; clients: { id: string; name: string }[]; assignments: { client_id: string; standard_slug: string; applied_revision: string; status: string; notes: string }[]; loading: boolean; canWrite: boolean }) {
  const save = useSaveProjectStandardAssignment();
  const [projectFilter, setProjectFilter] = useState("");
  const filteredClients = clients.filter((client) => client.name.toLowerCase().includes(projectFilter.toLowerCase()));
  if (loading) return <LoadingRows />;
  if (clients.length === 0) return <EmptyState text="Add a project before recording standards coverage." />;
  return <div className="space-y-5">
    <SearchField value={projectFilter} onChange={setProjectFilter} placeholder="Search projects" />
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-border bg-muted"><tr><th className="px-4 py-3 font-medium">Project</th><th className="px-4 py-3 font-medium">Standard</th><th className="px-4 py-3 font-medium">Revision</th><th className="px-4 py-3 font-medium">Status</th></tr></thead>
        <tbody className="divide-y divide-border">{filteredClients.flatMap((client) => standards.map((standard, index) => {
          const assignment = assignments.find((item) => item.client_id === client.id && item.standard_slug === standard.slug);
          const storedStatus = (assignment?.status ?? "review_needed") as CoverageStatus;
          const effectiveStatus = assignment && assignment.applied_revision !== standard.revision && storedStatus === "compliant" ? "review_needed" : storedStatus;
          return <tr key={`${client.id}-${standard.slug}`}>
            <td className="px-4 py-3 font-medium">{index === 0 ? client.name : <span className="sr-only">{client.name}</span>}</td>
            <td className="px-4 py-3">{standard.title}</td>
            <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{assignment?.applied_revision || "Not reviewed"}</td>
            <td className="w-52 px-4 py-2"><Select disabled={!canWrite || save.isPending} value={effectiveStatus} onValueChange={(value) => save.mutate({ client_id: client.id, standard_slug: standard.slug, applied_revision: value === "compliant" ? standard.revision : assignment?.applied_revision ?? "", status: value as CoverageStatus, notes: assignment?.notes ?? "" }, { onSuccess: () => toast.success("Coverage updated"), onError: (error) => toast.error(error.message) })}><SelectTrigger aria-label={`${client.name}: ${standard.title} status`}><SelectValue /></SelectTrigger><SelectContent>{Object.entries(COVERAGE_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></td>
          </tr>;
        }))}</tbody>
      </table>
    </div>
    {!canWrite ? <p className="text-sm text-muted-foreground">Editors can review coverage but only owners and developers can change it.</p> : null}
  </div>;
}

function DraftList({ drafts, documents, loading, canWrite, onNew }: { drafts: { id: string; target_slug: string; title: string; reason: string; status: string; updated_at: string }[]; documents: { slug: string; title: string }[]; loading: boolean; canWrite: boolean; onNew: () => void }) {
  const remove = useDeleteStandardDraft();
  if (loading) return <LoadingRows />;
  if (drafts.length === 0) return <div className="rounded-lg border border-border bg-card p-8 text-center"><p className="text-sm text-muted-foreground">No proposed changes yet.</p>{canWrite ? <Button className="mt-4" variant="outline" onClick={onNew}><Plus className="h-4 w-4" />Create the first draft</Button> : null}</div>;
  return <div className="divide-y divide-border rounded-lg border border-border bg-card">{drafts.map((draft) => <div key={draft.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-medium">{draft.title}</h2><Badge variant="outline">{draft.status}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{draft.reason || "No reason recorded."}</p><p className="mt-2 text-xs text-muted-foreground">For {documents.find((document) => document.slug === draft.target_slug)?.title ?? draft.target_slug} · updated {new Date(draft.updated_at).toLocaleDateString("en-GB")}</p></div>{canWrite ? <Button size="icon-sm" variant="ghost" aria-label={`Delete ${draft.title}`} onClick={() => { if (window.confirm(`Delete “${draft.title}”? This draft will be permanently lost.`)) remove.mutate(draft.id, { onSuccess: () => toast.success("Draft deleted"), onError: (error) => toast.error(error.message) }); }}><Trash2 className="h-4 w-4" /></Button> : null}</div>)}</div>;
}

function DraftDialog({ open, onOpenChange, documents }: { open: boolean; onOpenChange: (open: boolean) => void; documents: { slug: string; title: string; kind: string; revision: string }[] }) {
  const save = useSaveStandardDraft();
  const [target, setTarget] = useState("");
  const [title, setTitle] = useState("");
  const [reason, setReason] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<DraftStatus>("draft");
  const dirty = Boolean(target || title || reason || content);
  useEffect(() => { const guard = (event: BeforeUnloadEvent) => { if (open && dirty) event.preventDefault(); }; window.addEventListener("beforeunload", guard); return () => window.removeEventListener("beforeunload", guard); }, [dirty, open]);
  const selected = documents.find((document) => document.slug === target);
  const close = (next: boolean) => { if (!next && dirty && !window.confirm("Discard this unsaved draft?")) return; onOpenChange(next); };
  const submit = () => { if (!selected || !title.trim()) return; save.mutate({ target_kind: selected.kind as "standard" | "skill" | "document", target_slug: selected.slug, title, reason, content, base_revision: selected.revision, status }, { onSuccess: () => { toast.success("Draft saved"); setTarget(""); setTitle(""); setReason(""); setContent(""); setStatus("draft"); onOpenChange(false); }, onError: (error) => toast.error(error.message) }); };
  return <Dialog open={open} onOpenChange={close}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>New standards draft</DialogTitle><DialogDescription>Propose a change without modifying the approved source document.</DialogDescription></DialogHeader><div className="grid gap-4 py-2"><div className="grid gap-2"><Label>Document</Label><Select value={target} onValueChange={setTarget}><SelectTrigger><SelectValue placeholder="Choose a standard or Skill" /></SelectTrigger><SelectContent>{documents.map((document) => <SelectItem key={document.slug} value={document.slug}>{document.title}</SelectItem>)}</SelectContent></Select></div><div className="grid gap-2"><Label htmlFor="draft-title">Title</Label><Input id="draft-title" value={title} onChange={(event) => setTitle(event.target.value)} /></div><div className="grid gap-2"><Label htmlFor="draft-reason">Reason</Label><Textarea id="draft-reason" value={reason} onChange={(event) => setReason(event.target.value)} rows={3} /></div><div className="grid gap-2"><Label htmlFor="draft-content">Proposed Markdown</Label><Textarea id="draft-content" value={content} onChange={(event) => setContent(event.target.value)} rows={10} className="font-mono text-xs" /></div><div className="grid gap-2"><Label>Status</Label><Select value={status} onValueChange={(value) => setStatus(value as DraftStatus)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="ready">Ready for implementation</SelectItem><SelectItem value="implemented">Implemented</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent></Select></div></div><DialogFooter><Button variant="outline" onClick={() => close(false)}>Cancel</Button><Button disabled={!selected || !title.trim() || save.isPending} onClick={submit}>{save.isPending ? "Saving…" : "Save draft"}</Button></DialogFooter></DialogContent></Dialog>;
}

function LoadingRows() { return <div className="space-y-3" aria-label="Loading standards"><div className="h-24 animate-pulse rounded-lg bg-muted" /><div className="h-24 animate-pulse rounded-lg bg-muted" /><div className="h-24 animate-pulse rounded-lg bg-muted" /></div>; }
function EmptyState({ text }: { text: string }) { return <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">{text}</div>; }
function ErrorState({ retry }: { retry: () => void }) { return <div className="rounded-lg border border-border bg-card p-8 text-center"><p className="text-sm text-muted-foreground">The standards library could not be loaded.</p><Button className="mt-4" variant="outline" onClick={retry}>Try again</Button></div>; }