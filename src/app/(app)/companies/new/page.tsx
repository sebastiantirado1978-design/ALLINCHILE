import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CompanyForm } from "../company-form";

export default function NewCompanyPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/companies"
          className="h-9 w-9 rounded-md flex items-center justify-center hover:bg-[var(--muted)]"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nueva empresa</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Agrega una empresa para asociarle contactos.
          </p>
        </div>
      </div>

      <CompanyForm />
    </div>
  );
}
