import { cn } from "@/lib/utils";

export type SectionTitleProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function SectionTitle({ title, description, action, className }: SectionTitleProps) {
  return (
    <div className={cn("mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end", className)}>
      <div>
        <h2 className="text-2xl font-bold tracking-normal md:text-3xl">{title}</h2>
        {description ? <p className="mt-2 text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
