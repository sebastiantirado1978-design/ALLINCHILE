import Link from "next/link";
import { Plus, Search, Users, Mail, Phone, MessageCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/app/status-badge";
import { ExportCsvButton } from "@/components/app/export-button";
import { getCurrentOrg } from "@/server/queries/me";
import { listContacts } from "@/server/queries/contacts";
import { formatRelative, initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const org = await getCurrentOrg();
  if (!org) redirect("/dashboard");

  const params = await searchParams;
  const contacts = await listContacts(org.id, { search: params.q, status: params.status });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contactos</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {contacts.length} {contacts.length === 1 ? "contacto" : "contactos"} en tu organización
          </p>
        </div>
        <div className="flex gap-2">
          <ExportCsvButton entity="contacts" />
          <Link href="/contacts/new">
            <Button>
              <Plus className="h-4 w-4" />
              Nuevo contacto
            </Button>
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <form className="flex flex-col sm:flex-row gap-3" action="/contacts">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <Input
            name="q"
            placeholder="Buscar por nombre o email..."
            defaultValue={params.q}
            className="pl-9"
          />
        </div>
        <select
          name="status"
          defaultValue={params.status ?? "all"}
          className="h-10 px-3 rounded-md border border-[var(--input)] bg-white text-sm"
        >
          <option value="all">Todos los estados</option>
          <option value="lead">Lead</option>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
          <option value="churned">Perdido</option>
        </select>
        <Button type="submit" variant="outline">Filtrar</Button>
      </form>

      {/* Lista */}
      {contacts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] bg-white p-12 text-center">
          <div className="h-12 w-12 mx-auto rounded-full bg-[var(--muted)] flex items-center justify-center mb-4">
            <Users className="h-5 w-5 text-[var(--muted-foreground)]" />
          </div>
          <h3 className="font-semibold">Aún no tienes contactos</h3>
          <p className="text-sm text-[var(--muted-foreground)] mt-1 mb-4">
            Crea tu primer contacto para empezar a gestionarlos.
          </p>
          <Link href="/contacts/new">
            <Button><Plus className="h-4 w-4" />Crear contacto</Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--border)] bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--muted)] text-[var(--muted-foreground)] text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Nombre</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Teléfono</th>
                <th className="text-left px-4 py-3 font-medium">Estado</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Última actividad</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {contacts.map((c) => (
                <tr key={c.id} className="hover:bg-[var(--muted)]/40 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/contacts/${c.id}`} className="flex items-center gap-3 group">
                      <div className="h-9 w-9 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-xs font-semibold shrink-0">
                        {initials(c.full_name)}
                      </div>
                      <div>
                        <p className="font-medium group-hover:text-[var(--primary)] transition-colors">
                          {c.full_name}
                        </p>
                        {c.job_title && (
                          <p className="text-xs text-[var(--muted-foreground)]">{c.job_title}</p>
                        )}
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-[var(--muted-foreground)]">
                    {c.email ?? "—"}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-[var(--muted-foreground)]">
                    {c.phone ?? c.whatsapp ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-[var(--muted-foreground)] text-xs">
                    {c.last_interaction_at ? formatRelative(c.last_interaction_at) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {c.email && (
                        <a
                          href={`mailto:${c.email}`}
                          className="h-8 w-8 rounded-md hover:bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--primary)]"
                          title="Enviar email"
                        >
                          <Mail className="h-4 w-4" />
                        </a>
                      )}
                      {(c.whatsapp || c.phone) && (
                        <a
                          href={`https://wa.me/${(c.whatsapp ?? c.phone ?? "").replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-8 w-8 rounded-md hover:bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-emerald-600"
                          title="Abrir WhatsApp"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </a>
                      )}
                      {c.phone && (
                        <a
                          href={`tel:${c.phone}`}
                          className="h-8 w-8 rounded-md hover:bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--primary)]"
                          title="Llamar"
                        >
                          <Phone className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
