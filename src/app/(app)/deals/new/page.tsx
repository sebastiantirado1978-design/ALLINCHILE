import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCurrentOrg } from "@/server/queries/me";
import {
  ensureDefaultPipeline,
  listPipelines,
  listStages,
} from "@/server/queries/deals";
import { listContacts } from "@/server/queries/contacts";
import { listOrgMembers } from "@/server/queries/tasks";
import { DealForm } from "../deal-form";

export const dynamic = "force-dynamic";

export default async function NewDealPage({
  searchParams,
}: {
  searchParams: Promise<{ contact_id?: string }>;
}) {
  const org = await getCurrentOrg();
  if (!org) redirect("/dashboard");

  await ensureDefaultPipeline(org.id);
  const [pipelines, stages, contacts, members] = await Promise.all([
    listPipelines(org.id),
    listStages(org.id),
    listContacts(org.id),
    listOrgMembers(org.id),
  ]);

  const params = await searchParams;
  const initial = params.contact_id ? { contact_id: params.contact_id } : undefined;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/deals"
          className="h-9 w-9 rounded-md flex items-center justify-center hover:bg-[var(--muted)]"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nueva oportunidad</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Registra una oportunidad y muévela por el pipeline.
          </p>
        </div>
      </div>

      <DealForm
        pipelines={pipelines}
        stages={stages}
        contacts={contacts.map((c) => ({ id: c.id, full_name: c.full_name }))}
        members={members}
        initial={initial}
      />
    </div>
  );
}
