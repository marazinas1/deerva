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
        "grid h-auto w-full gap-1 overflow-x-auto rounded-lg border border-border bg-muted p-1 text-muted-foreground sm:inline-grid sm:w-auto",
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
        "min-h-9 whitespace-normal rounded-md border border-transparent px-3 text-xs shadow-none data-[state=active]:border-border data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-none sm:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Tabs as AdminTabs, TabsContent as AdminTabsContent, AdminTabsList, AdminTabsTrigger };