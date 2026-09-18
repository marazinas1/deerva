import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Copy } from "lucide-react";
import { toast } from "sonner";

import { MessageResponse } from "@/components/ai-elements/message";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getStandardsDocument } from "@/lib/standards.functions";

export const Route = createFileRoute("/_authenticated/admin/standards/$slug")({
  head: () => ({
    meta: [
      { title: "Standards Document | Deerva" },
      { name: "description", content: "A read-only document from the Deerva standards library." },
      { property: "og:title", content: "Standards Document | Deerva" },
      { property: "og:description", content: "A read-only document from the Deerva standards library." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StandardsDocumentPage,
});

function StandardsDocumentPage() {
  const { slug } = Route.useParams();
  const document = useQuery({ queryKey: ["admin", "standards", "document", slug], queryFn: () => getStandardsDocument({ data: { slug } }) });
  if (document.isLoading) return <div className="h-96 animate-pulse rounded-lg bg-muted" />;
  if (document.error || !document.data) return <div className="space-y-4"><p className="text-sm text-muted-foreground">This document could not be opened.</p><Button asChild variant="outline"><Link to="/admin/standards">Back to library</Link></Button></div>;
  const item = document.data;
  return <div className="w-full space-y-8"><Button asChild variant="ghost" className="-ml-3"><Link to="/admin/standards"><ArrowLeft className="h-4 w-4" />Back to Standards</Link></Button><AdminPageHeader title={item.title} description={item.description} action={<Button variant="outline" onClick={() => navigator.clipboard.writeText(item.content).then(() => toast.success("Document copied"))}><Copy className="h-4 w-4" />Copy</Button>} /><div className="flex flex-wrap gap-2"><Badge variant="outline">{item.kind}</Badge><Badge variant="outline">{item.category}</Badge><Badge variant="outline" className="font-mono">rev {item.revision}</Badge></div><article className="rounded-lg border border-border bg-card p-5 sm:p-8"><MessageResponse className="prose-sm max-w-none">{item.content}</MessageResponse></article></div>;
}