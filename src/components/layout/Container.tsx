import { cn } from "@/lib/utils";

export type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: "default" | "wide";
};

export function Container({ className, size = "default", ...props }: ContainerProps) {
  void size;

  return (
    <div
      className={cn(
        "mx-auto w-full lg:px-4",
        className,
      )}
      {...props}
    />
  );
}
