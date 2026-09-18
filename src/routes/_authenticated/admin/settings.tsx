import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import {
  AdminTabs,
  AdminTabsContent,
  AdminTabsList,
  AdminTabsTrigger,
} from "@/components/admin/AdminTabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAdminMe } from "@/lib/admin.functions";
import {
  EMPTY_SETTINGS,
  getSiteSettings,
  updateSiteSettings,
  type SiteSettings,
  type SocialLink,
} from "@/lib/settings.functions";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const queryClient = useQueryClient();
  const { data: me } = useQuery({ queryKey: ["admin", "me"], queryFn: () => getAdminMe() });
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "site-settings"],
    queryFn: () => getSiteSettings(),
  });

  const canEdit = me?.isManager ?? false;
  const [form, setForm] = useState<SiteSettings>(EMPTY_SETTINGS);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (data) {
      setForm(data);
      setDirty(false);
    }
  }, [data]);

  // Unsaved changes must not disappear silently on navigation.
  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const save = useMutation({
    mutationFn: (values: SiteSettings) => updateSiteSettings({ data: values }),
    onSuccess: (row) => {
      queryClient.setQueryData(["admin", "site-settings"], row);
      setDirty(false);
      toast.success("Business details saved");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function set<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  function setLink(index: number, patch: Partial<SocialLink>) {
    set(
      "social_links",
      form.social_links.map((link, i) => (i === index ? { ...link, ...patch } : link)),
    );
  }

  return (
    <div className="w-full space-y-8">
      <AdminPageHeader
        title="Settings"
        description="Business details used across the site, its metadata and its search listing."
      />

      {!canEdit ? (
        <p className="rounded-md border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          You can view these details, but only an owner can change them.
        </p>
      ) : null}

      <AdminTabs defaultValue="business">
        <AdminTabsList className="grid-cols-1">
          <AdminTabsTrigger value="business">Business &amp; appearance</AdminTabsTrigger>
        </AdminTabsList>

        <AdminTabsContent value="business" className="mt-6">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <form
              className="space-y-6"
              onSubmit={(event) => {
                event.preventDefault();
                save.mutate(form);
              }}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  id="business_name"
                  label="Business name"
                  value={form.business_name}
                  disabled={!canEdit}
                  onChange={(v) => set("business_name", v)}
                />
                <Field
                  id="primary_domain"
                  label="Primary domain"
                  placeholder="deerva.com"
                  value={form.primary_domain}
                  disabled={!canEdit}
                  onChange={(v) => set("primary_domain", v)}
                />
                <div className="sm:col-span-2">
                  <Field
                    id="tagline"
                    label="Tagline"
                    value={form.tagline}
                    disabled={!canEdit}
                    onChange={(v) => set("tagline", v)}
                  />
                </div>
                <Field
                  id="contact_email"
                  label="Contact email"
                  type="email"
                  value={form.contact_email}
                  disabled={!canEdit}
                  onChange={(v) => set("contact_email", v)}
                />
                <Field
                  id="contact_phone"
                  label="Contact phone"
                  value={form.contact_phone}
                  disabled={!canEdit}
                  onChange={(v) => set("contact_phone", v)}
                />
                <div className="sm:col-span-2">
                  <Field
                    id="address_street"
                    label="Street address"
                    value={form.address_street}
                    disabled={!canEdit}
                    onChange={(v) => set("address_street", v)}
                  />
                </div>
                <Field
                  id="address_city"
                  label="City"
                  value={form.address_city}
                  disabled={!canEdit}
                  onChange={(v) => set("address_city", v)}
                />
                <Field
                  id="address_country"
                  label="Country"
                  value={form.address_country}
                  disabled={!canEdit}
                  onChange={(v) => set("address_country", v)}
                />
              </div>

              <div>
                <h2 className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Social links</h2>
                {form.social_links.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    No social profiles added. They appear in the site's search listing.
                  </p>
                ) : (
                  <div className="mt-3 space-y-3">
                    {form.social_links.map((link, index) => (
                      <div key={index} className="flex flex-wrap items-end gap-3">
                        <div className="w-40">
                          <Label className="text-xs text-muted-foreground">Label</Label>
                          <Input
                            value={link.label}
                            disabled={!canEdit}
                            onChange={(e) => setLink(index, { label: e.target.value })}
                          />
                        </div>
                        <div className="min-w-[220px] flex-1">
                          <Label className="text-xs text-muted-foreground">URL</Label>
                          <Input
                            value={link.url}
                            disabled={!canEdit}
                            onChange={(e) => setLink(index, { url: e.target.value })}
                          />
                        </div>
                        {canEdit ? (
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() =>
                              set(
                                "social_links",
                                form.social_links.filter((_, i) => i !== index),
                              )
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </Button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}

                {canEdit ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4"
                    onClick={() => set("social_links", [...form.social_links, { label: "", url: "" }])}
                  >
                    <Plus className="h-4 w-4" />
                    Add a link
                  </Button>
                ) : null}
              </div>

              {canEdit ? (
                <div className="flex items-center gap-3 border-t border-border pt-6">
                  <Button type="submit" disabled={save.isPending || !dirty}>
                    {save.isPending ? "Saving…" : "Save changes"}
                  </Button>
                  {dirty ? <span className="text-xs text-muted-foreground">Unsaved changes</span> : null}
                </div>
              ) : null}
            </form>
          )}
        </AdminTabsContent>
      </AdminTabs>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  disabled,
  type = "text",
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5"
      />
    </div>
  );
}
