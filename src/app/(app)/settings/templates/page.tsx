import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getCurrentOrg } from "@/server/queries/me";
import { listTemplates } from "@/server/queries/settings";
import { TemplatesManager } from "./templates-manager";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const org = await getCurrentOrg();
  if (!org) redirect("/dashboard");

  const templates = await listTemplates(org.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plantillas de mensajes</CardTitle>
        <CardDescription>
          Respuestas rápidas reutilizables para tickets. Asigna un atajo (ej:{" "}
          <code className="text-xs bg-[var(--muted)] px-1 rounded">/saludo</code>) y
          aparecerá al escribir en el inbox.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TemplatesManager templates={templates} />
      </CardContent>
    </Card>
  );
}
