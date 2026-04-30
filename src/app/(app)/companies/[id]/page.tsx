import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Building2,
  Globe,
  MapPin,
  Users,
  StickyNote,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/app/status-badge";
import { NotesSection } from "@/components/app/notes-section";
import { AuditLogList } from "@/components/app/audit-log-list";
import { getCurrentOrg, getCurrentUser } from "@/server/queries/me";
import { getCompany, listContactsByCompany } from "@/server/queries/companies";
import { listAuditLogs } from "@/server/queries/contacts";
import { listNotesFor } from "@/server/queries/notes";
import { initials, formatDate } from "@/lib/utils";
import { DeleteCompanyButton } from "./delete-button";

export const dynamic = "force-dynamic";

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const org = await getCurrentOrg();
  const user = await getCurrentUser();
  if (!org || !user) redirect("/dashboard");

  const { id } = await params;
  const company = await getCompany(org.id, id);
  if (!company) notFound();

  const [contacts, notes, logs] = await Promise.all([
    listContactsByCompany(org.id, id),
    listNotesFor(org.id, "company", id),
    listAuditLogs(org.id, "company", id, 10),
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Link
          href="/companies"
          className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a empresas
        </Link>
        <div className="flex gap-2">
          <Link href={`/companies/${company.id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
          </Link>
          <DeleteCompanyButton id={company.id} />
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-5">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white flex items-center justify-center shrink-0">
              <Building2 className="h-7 w-7" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold tracking-tight">{company.name}</h1>
              {company.legal_name && (
                <p className="text-[var(--muted-foreground)]">{company.legal_name}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {company.industry && (
                  <span className="px-2 py-1 rounded-full bg-[var(--muted)]">
                    {company.industry}
                  </span>
                )}
                {company.size && (
                  <span className="px-2 py-1 rounded-full bg-[var(--muted)]">
                    {company.size} empleados
                  </span>
                )}
                {company.country && (
                  <span className="px-2 py-1 rounded-full bg-[var(--muted)]">
                    {[company.city, company.country].filter(Boolean).join(", ")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {company.tax_id && (
                <DetailRow label="RUT / Tax ID">
                  <span className="font-mono">{company.tax_id}</span>
                </DetailRow>
              )}
              {company.website && (
                <DetailRow label="Sitio web" icon={Globe}>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--primary)] hover:underline"
                  >
                    {company.website}
                  </a>
                </DetailRow>
              )}
              {company.address && (
                <DetailRow label="Dirección" icon={MapPin}>
                  {company.address}
                </DetailRow>
              )}
              <DetailRow label="Creada">{formatDate(company.created_at)}</DetailRow>
              {company.notes && (
                <div className="pt-3 border-t border-[var(--border)]">
                  <p className="text-xs font-medium text-[var(--muted-foreground)] mb-1">
                    Notas del perfil
                  </p>
                  <p className="text-sm whitespace-pre-wrap">{company.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Contactos ({contacts.length})
              </CardTitle>
              <Link href={`/contacts/new`}>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                  Nuevo contacto
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {contacts.length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)] text-center py-6">
                  Aún no hay contactos en esta empresa.
                  <br />
                  <span className="text-xs">
                    (Para asociar un contacto, edítalo y selecciona esta empresa)
                  </span>
                </p>
              ) : (
                <ul className="divide-y divide-[var(--border)]">
                  {contacts.map((c) => (
                    <li key={c.id} className="py-3">
                      <Link
                        href={`/contacts/${c.id}`}
                        className="flex items-center gap-3 hover:text-[var(--primary)]"
                      >
                        <div className="h-8 w-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-xs font-semibold shrink-0">
                          {initials(c.full_name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{c.full_name}</p>
                          {c.job_title && (
                            <p className="text-xs text-[var(--muted-foreground)]">
                              {c.job_title}
                            </p>
                          )}
                        </div>
                        <StatusBadge status={c.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StickyNote className="h-4 w-4" />
                Notas internas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NotesSection
                notes={notes}
                relatedType="company"
                relatedId={company.id}
                currentUserId={user.id}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Historial</CardTitle>
            </CardHeader>
            <CardContent>
              <AuditLogList logs={logs} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: typeof Globe;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      {Icon && <Icon className="h-4 w-4 text-[var(--muted-foreground)] mt-0.5 shrink-0" />}
      <div className="min-w-0">
        <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
        <p className="text-sm font-medium break-words">{children}</p>
      </div>
    </div>
  );
}
