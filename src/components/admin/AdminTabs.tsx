import type { ComponentProps } from "react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

function AdminTabsList({ className, ...props }: ComponentProps<typeof TabsList>) {
  return (
    <TabsList
      className={cn(
        "flex h-auto w-full justify-start gap-6 overflow-x-auto rounded-none border-0 border-b border-border bg-transparent p-0 text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function AdminTabsTrigger({ className, ...props }: ComponentProps<typeof TabsTrigger>) {
  return (
    <TabsTrigger
      className={cn(
        "min-h-10 shrink-0 whitespace-nowrap rounded-none border-0 border-b-2 border-transparent bg-transparent px-1 py-3 text-sm font-normal shadow-none transition-colors hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-medium data-[state=active]:text-foreground data-[state=active]:shadow-none",
        className,
      )}
      {...props}
    />
  );
}

export { Tabs as AdminTabs, TabsContent as AdminTabsContent, AdminTabsList, AdminTabsTrigger };