import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getAdminMe,
  inviteAdminUser,
  listAdminUsers,
  setUserRole,
  type AppRole,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: UsersPage,
});

/** developer -> owner -> editor. Developer is hardcoded and cannot be granted here. */
const ASSIGNABLE: AppRole[] = ["owner", "editor"];
const NO_ACCESS = "none";

function UsersPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"owner" | "editor">("editor");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const { data: me } = useQuery({ queryKey: ["admin", "me"], queryFn: () => getAdminMe() });
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => listAdminUsers(),
  });

  const canManage = me?.isManager ?? false;
  const isDeveloper = me?.isDeveloper ?? false;
  const visibleUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (users ?? []).filter((user) => {
      if (roleFilter !== "all" && (user.role ?? NO_ACCESS) !== roleFilter) return false;
      if (!term) return true;
      return [user.full_name ?? "", user.email ?? "", user.role ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [users, search, roleFilter]);

  const invite = useMutation({
    mutationFn: () =>
      inviteAdminUser({
        data: {
          email,
          ...(fullName ? { fullName } : {}),
          role,
          redirectTo: `${window.location.origin}/admin/set-password`,
        },
      }),
    onSuccess: () => {
      toast.success("Invitation sent");
      setOpen(false);
      setEmail("");
      setFullName("");
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const changeRole = useMutation({
    mutationFn: (input: { userId: string; role: AppRole | null }) => setUserRole({ data: input }),
    onSuccess: () => {
      toast.success("Role updated");
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "me"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!canManage) {
    return (
      <div className="w-full">
        <AdminPageHeader title="Users" description="Only owners can manage people." />
      </div>
    );
  }

  return (
    <div className="w-full">
      <AdminPageHeader
        title="Users"
        description="Who can access the Deerva admin, and how."
        action={<Button onClick={() => setOpen(true)}>Invite user</Button>}
      />

      <div className="mt-8 flex flex-wrap items-center gap-3 border-y border-border py-3">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search people"
            className="pl-9"
            aria-label="Search users"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40" aria-label="Filter by role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="developer">Developer</SelectItem>
            <SelectItem value="owner">Owner</SelectItem>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value={NO_ACCESS}>No access</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {visibleUsers.length} of {(users ?? []).length}
        </span>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Person</TableHead>
              <TableHead className="w-56">Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={2} className="text-sm text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : (
              visibleUsers.map((user) => {
                const isSelf = user.id === me?.userId;
                const locked = isSelf || (user.isDeveloper && !isDeveloper);
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <p className="font-medium text-foreground">{user.full_name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </TableCell>
                    <TableCell>
                      {locked ? (
                        <p className="text-sm capitalize text-muted-foreground">
                          {user.role ?? "No access"}
                          <span className="ml-2 text-xs">
                            {isSelf ? "(you)" : "· managed by the developer"}
                          </span>
                        </p>
                      ) : (
                        <Select
                          value={user.role ?? NO_ACCESS}
                          disabled={changeRole.isPending}
                          onValueChange={(value) =>
                            changeRole.mutate({
                              userId: user.id,
                              role: value === NO_ACCESS ? null : (value as AppRole),
                            })
                          }
                        >
                          <SelectTrigger aria-label={`Role for ${user.email ?? user.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ASSIGNABLE.map((item) => (
                              <SelectItem key={item} value={item} className="capitalize">
                                {item}
                              </SelectItem>
                            ))}
                            <SelectItem value={NO_ACCESS}>No access</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite user</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              invite.mutate();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-name">Full name</Label>
              <Input
                id="invite-name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-role">Role</Label>
              <Select value={role} onValueChange={(value) => setRole(value as "owner" | "editor")}>
                <SelectTrigger id="invite-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSIGNABLE.map((item) => (
                    <SelectItem key={item} value={item} className="capitalize">
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={invite.isPending}>
                {invite.isPending ? "Sending…" : "Send invitation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
