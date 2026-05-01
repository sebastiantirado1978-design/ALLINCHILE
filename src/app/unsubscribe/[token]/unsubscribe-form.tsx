"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { markContactUnsubscribedAction } from "@/server/actions/unsubscribe";

export function UnsubscribeForm({
  token,
  contactName,
  contactEmail,
  orgName,
}: {
  token: string;
  contactName: string;
  contactEmail: string | null;
  orgName: string;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleConfirm() {
    setStatus("loading");
    setErrorMsg(null);
    const res = await markContactUnsubscribedAction(token);
    if (res.error) {
      setStatus("error");
      setErrorMsg(res.error);
      return;
    }
    setStatus("done");
  }

  if (status === "done") {
    return (
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-bold">Listo, te dimos de baja</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          {contactName}, no recibirás más comunicaciones comerciales de{" "}
          <strong>{orgName}</strong>.
        </p>
        <p className="text-xs text-[var(--muted-foreground)] pt-3">
          Si recibiste mensajes que no autorizaste, escríbenos a{" "}
          <a
            href="mailto:privacidad@allinchile.cl"
            className="text-[var(--accent)] underline"
          >
            privacidad@allinchile.cl
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold mb-2">¿Confirmar baja?</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Hola {contactName.split(" ")[0]}, vas a dejar de recibir
          comunicaciones comerciales de <strong>{orgName}</strong>.
        </p>
      </div>

      {contactEmail && (
        <div className="text-xs text-[var(--muted-foreground)] bg-[#fafafa] rounded-md px-3 py-2 border border-[var(--border)]">
          {contactEmail}
        </div>
      )}

      <Button
        onClick={handleConfirm}
        loading={status === "loading"}
        className="w-full"
      >
        Sí, darme de baja
      </Button>

      {errorMsg && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
          {errorMsg}
        </p>
      )}

      <p className="text-xs text-[var(--muted-foreground)] text-center">
        Esta acción es reversible: contacta directamente a {orgName} si te
        suscribes después.
      </p>
    </div>
  );
}
