"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteContactAction } from "@/server/actions/contacts";

export function DeleteContactButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();

  function onClick() {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 4000);
      return;
    }
    start(async () => {
      const res = await deleteContactAction(id);
      if (res?.error) toast.error(res.error);
      else toast.success("Contacto eliminado");
    });
  }

  return (
    <Button variant={confirming ? "danger" : "outline"} size="sm" onClick={onClick} loading={pending}>
      <Trash2 className="h-4 w-4" />
      {confirming ? "¿Confirmar eliminación?" : "Eliminar"}
    </Button>
  );
}
