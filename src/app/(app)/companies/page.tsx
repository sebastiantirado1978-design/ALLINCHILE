import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Search, Building2, Globe, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExportCsvButton } from "@/components/app/export-button";
import { getCurrentOrg } from "@/server/queries/me";
import { listCompanies } from "@/server/queries/companies";

export const dynamic = "force-dynamic";

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const org = await getCurrentOrg();
  if (!org) redirect("/dashboard");

  const params = await searchParams;
  const companies = await listCompanies(org.id, { search: params.q });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Empresas</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {companies.length} {companies.length === 1 ? "empresa" : "empresas"}
          </p>
        </div>
        <div className="flex gap-2">
          <ExportCsvButton entity="companies" />
          <Link href="/companies/new">
            <Button>
              <Plus className="h-4 w-4" />
              Nueva empresa
            </Button>
          </Link>
        </div>
      </div>

      <form className="flex gap-3" action="/companies">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <Input
            name="q"
            placeholder="Buscar por nombre o RUT..."
            defaultValue={params.q}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="outline">Buscar</Button>
      </form>

      {companies.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] bg-white p-12 text-center">
          <div className="h-12 w-12 mx-auto rounded-full bg-[var(--muted)] flex items-center justify-center mb-4">
            <Building2 className="h-5 w-5 text-[var(--muted-foreground)]" />
          </div>
          <h3 className="font-semibold">Sin empresas aún</h3>
          <p className="text-sm text-[var(--muted-foreground)] mt-1 mb-4">
            Agrupa contactos por empresa para una mejor visión comercial.
          </p>
          <Link href="/companies/new">
            <Button><Plus className="h-4 w-4" />Crear empresa</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((c) => (
            <Link
              key={c.id}
              href={`/companies/${c.id}`}
              className="rounded-xl border border-[var(--border)] bg-white p-5 hover:shadow-md hover:border-[var(--accent)]/50 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{c.name}</p>
                  {c.industry && (
                    <p className="text-xs text-[var(--muted-foreground)]">{c.industry}</p>
                  )}
                </div>
              </div>
              <div className="mt-3 space-y-1 text-xs text-[var(--muted-foreground)]">
                {c.tax_id && <p className="font-mono">{c.tax_id}</p>}
                {c.website && (
                  <p className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    <span className="truncate">{c.website.replace(/^https?:\/\//, "")}</span>
                  </p>
                )}
                {(c.city || c.country) && (
                  <p className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {[c.city, c.country].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
