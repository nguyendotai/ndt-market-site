import { PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex min-h-64 flex-col items-center justify-center gap-4 p-8 text-center">
        <PackageOpen className="h-10 w-10 text-primary" aria-hidden="true" />
        <div>
          <p className="text-lg font-semibold">{title}</p>
          {description ? <p className="mt-2 max-w-md text-muted-foreground">{description}</p> : null}
        </div>
        {actionLabel ? <Button onClick={onAction}>{actionLabel}</Button> : null}
      </CardContent>
    </Card>
  );
}
