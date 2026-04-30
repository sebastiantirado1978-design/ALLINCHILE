import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrg } from "@/server/queries/me";
import { toCsv } from "@/lib/csv";
import { exportLimiter } from "@/lib/rate-limit";

const allowed = ["contacts", "companies", "tasks", "tickets", "deals"] as const;
type Entity = (typeof allowed)[number];

const columnsByEntity: Record<Entity, { key: string; label: string }[]> = {
  contacts: [
    { key: "full_name", label: "Nombre" },
    { key: "job_title", label: "Cargo" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Teléfono" },
    { key: "whatsapp", label: "WhatsApp" },
    { key: "city", label: "Ciudad" },
    { key: "status", label: "Estado" },
    { key: "source", label: "Fuente" },
    { key: "created_at", label: "Creado" },
  ],
  companies: [
    { key: "name", label: "Nombre" },
    { key: "legal_name", label: "Razón social" },
    { key: "tax_id", label: "RUT" },
    { key: "industry", label: "Industria" },
    { key: "size", label: "Tamaño" },
    { key: "country", label: "País" },
    { key: "city", label: "Ciudad" },
    { key: "website", label: "Sitio web" },
    { key: "created_at", label: "Creada" },
  ],
  tasks: [
    { key: "title", label: "Título" },
    { key: "status", label: "Estado" },
    { key: "priority", label: "Prioridad" },
    { key: "due_at", label: "Vence" },
    { key: "completed_at", label: "Completada" },
    { key: "created_at", label: "Creada" },
  ],
  tickets: [
    { key: "number", label: "#" },
    { key: "subject", label: "Asunto" },
    { key: "status", label: "Estado" },
    { key: "priority", label: "Prioridad" },
    { key: "last_message_at", label: "Último mensaje" },
    { key: "created_at", label: "Creado" },
  ],
  deals: [
    { key: "title", label: "Título" },
    { key: "value_amount", label: "Valor" },
    { key: "currency", label: "Moneda" },
    { key: "expected_close_date", label: "Cierre esperado" },
    { key: "is_won", label: "Ganada" },
    { key: "is_lost", label: "Perdida" },
    { key: "created_at", label: "Creada" },
  ],
};

export async function GET(_req: NextRequest, { params }: { params: Promise<{ entity: string }> }) {
  const { entity } = await params;
  if (!(allowed as readonly string[]).includes(entity)) {
    return NextResponse.json({ error: "Entidad no soportada" }, { status: 400 });
  }
  const e = entity as Entity;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const rl = exportLimiter.check(user.id);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Demasiadas exportaciones. Espera ${rl.resetInSec}s.` },
      { status: 429, headers: { "Retry-After": String(rl.resetInSec ?? 60) } },
    );
  }

  const org = await getCurrentOrg();
  if (!org) return NextResponse.json({ error: "Sin organización activa" }, { status: 403 });

  const cols = columnsByEntity[e];
  const select = cols.map((c) => c.key).join(", ");

  const { data, error } = await supabase
    .from(e)
    .select(select)
    .eq("organization_id", org.id)
    .order("created_at", { ascending: false })
    .limit(5000);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  const csv = toCsv(rows, cols as { key: string; label: string }[]);
  const filename = `allinchile-${e}-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
