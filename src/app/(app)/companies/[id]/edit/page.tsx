import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCurrentOrg } from "@/server/queries/me";
import { getCompany } from "@/server/queries/companies";
import { CompanyForm } from "../../company-form";

export const dynamic = "force-dynamic";

export default async function EditCompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const org = await getCurrentOrg();
  if (!org) redirect("/dashboard");

  const { id } = await params;
  const company = await getCompany(org.id, id);
  if (!company) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/companies/${id}`}
          className="h-9 w-9 rounded-md flex items-center justify-center hover:bg-[var(--muted)]"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar empresa</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Actualiza los datos de {company.name}.
          </p>
        </div>
      </div>

      <CompanyForm
        companyId={id}
        initial={{
          name: company.name,
          legal_name: company.legal_name ?? "",
          tax_id: company.tax_id ?? "",
          industry: company.industry ?? "",
          website: company.website ?? "",
          size: company.size ?? "",
          country: company.country,
          city: company.city ?? "",
          address: company.address ?? "",
          notes: company.notes ?? "",
        }}
      />
    </div>
  );
}
