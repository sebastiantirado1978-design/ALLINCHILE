import Link from "next/link";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExportCsvButton({
  entity,
  label = "Exportar CSV",
}: {
  entity: "contacts" | "companies" | "tasks" | "tickets" | "deals";
  label?: string;
}) {
  return (
    <Link href={`/api/export/${entity}`} prefetch={false}>
      <Button variant="outline" size="sm">
        <Download className="h-4 w-4" />
        {label}
      </Button>
    </Link>
  );
}
