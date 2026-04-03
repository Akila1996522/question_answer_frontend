import { FolderX } from "lucide-react";
import { buttonVariants } from "./button";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-4 text-center p-8 border-2 border-dashed rounded-lg bg-muted/10">
      <div className="rounded-full bg-muted p-4">
        <FolderX className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="max-w-[420px] space-y-2">
        <h3 className="font-semibold text-xl tracking-tight">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {actionLabel && actionHref && (
        <Link href={actionHref} className={cn(buttonVariants({ variant: "default" }), "mt-4")}>
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
