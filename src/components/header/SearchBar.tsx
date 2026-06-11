import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type SearchBarProps = {
  className?: string;
  compact?: boolean;
};

export function SearchBar({ className, compact = false }: SearchBarProps) {
  return (
    <form
      action="/search"
      role="search"
      aria-label="Tim kiem san pham"
      className={cn("relative flex w-full items-center gap-2", className)}
    >
      <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
      <Input
        name="q"
        type="search"
        placeholder="Tim rau cu, thit ca, sua..."
        className={cn("h-10 rounded-md bg-card pl-9", compact && "h-9 text-sm")}
      />
      {!compact ? (
        <Button type="submit" className="hidden sm:inline-flex">
          Tim
        </Button>
      ) : null}
    </form>
  );
}
