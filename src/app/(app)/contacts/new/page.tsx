import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCurrentOrg } from "@/server/queries/me";
import { listCompanies } from "@/server/queries/companies";
import { ContactForm } from "../contact-form";

export const dynamic = "force-dynamic";

export default async function NewContactPage() {
  const org = await getCurrentOrg();
  if (!org) redirect("/dashboard");

  const companies = await listCompanies(org.id);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/contacts"
          className="h-9 w-9 rounded-md flex items-center justify-center hover:bg-[var(--muted)]"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nuevo contacto</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Agrega un cliente, lead o prospecto a tu base.
          </p>
        </div>
      </div>

      <ContactForm
        companies={companies.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
