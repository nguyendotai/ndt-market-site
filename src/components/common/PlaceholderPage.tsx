import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section className="container py-10">
      <Card>
        <CardContent className="flex min-h-72 flex-col items-start justify-center gap-4 p-6 md:p-10">
          <h1 className="text-3xl font-bold tracking-normal">{title}</h1>
          <p className="max-w-2xl text-muted-foreground">{description}</p>
          <Button asChild>
            <Link href="/products">Tiep tuc mua sam</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
