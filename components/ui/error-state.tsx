import { AlertTriangle } from "lucide-react";
import { Button } from "./button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An error occurred while loading the data. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-4 text-center p-8 border border-destructive/20 rounded-lg bg-destructive/5">
      <div className="rounded-full bg-destructive/10 p-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <div className="max-w-[420px] space-y-2">
        <h3 className="font-semibold text-xl tracking-tight text-destructive">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="mt-4">
          Try Again
        </Button>
      )}
    </div>
  );
}
