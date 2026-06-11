import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export type ErrorStateProps = {
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = "Co loi xay ra",
  description = "Vui long thu lai sau it phut.",
  retryLabel = "Thu lai",
  onRetry,
}: ErrorStateProps) {
  return (
    <Card className="border-destructive/40">
      <CardContent className="flex min-h-48 flex-col items-center justify-center gap-4 p-8 text-center">
        <AlertTriangle className="h-10 w-10 text-destructive" aria-hidden="true" />
        <div>
          <p className="text-lg font-semibold">{title}</p>
          <p className="mt-2 max-w-md text-muted-foreground">{description}</p>
        </div>
        {onRetry ? <Button onClick={onRetry}>{retryLabel}</Button> : null}
      </CardContent>
    </Card>
  );
}
