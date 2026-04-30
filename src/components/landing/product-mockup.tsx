/**
 * Mockup visual del producto para mostrar en la landing.
 * No conecta a datos reales — es solo presentación.
 */
export function ProductMockup() {
  return (
    <div className="rounded-2xl bg-slate-900 p-2 shadow-2xl ring-1 ring-slate-800/40">
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
        <span className="ml-3 text-xs text-slate-400">app.allinchile.cl/inbox</span>
      </div>

      <div className="rounded-xl bg-white overflow-hidden">
        {/* Topbar */}
        <div className="h-12 border-b border-slate-200 flex items-center px-4 gap-3">
          <span className="text-sm font-bold tracking-tight">
            ALLIN<span className="text-cyan-500">CHILE</span>
          </span>
          <div className="flex-1 mx-4">
            <div className="h-7 rounded-md bg-slate-100 px-3 flex items-center text-xs text-slate-400">
              Buscar contactos, oportunidades, tickets...
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">3</div>
            <div className="h-7 w-7 rounded-full bg-slate-900 text-white text-xs font-semibold flex items-center justify-center">ST</div>
          </div>
        </div>

        {/* Body: Kanban inbox */}
        <div className="bg-slate-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold">Inbox</h3>
              <p className="text-xs text-slate-500">12 conversaciones activas</p>
            </div>
            <div className="flex gap-1">
              <span className="text-xs px-2 py-1 rounded bg-cyan-50 text-cyan-700">WhatsApp</span>
              <span className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700">Email</span>
              <span className="text-xs px-2 py-1 rounded bg-purple-50 text-purple-700">Instagram</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Columna 1 — Nuevos */}
            <div className="rounded-lg bg-white border border-slate-200 p-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-slate-700 uppercase">Nuevos</span>
                <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 rounded">4</span>
              </div>
              <MockTicket name="María López" channel="WhatsApp" preview="¿Tienen stock del modelo SP-200?" priority="high" time="hace 2 min" />
              <MockTicket name="Carlos R." channel="Email" preview="Cotización para 50 unidades..." priority="normal" time="hace 18 min" />
            </div>

            {/* Columna 2 — En proceso */}
            <div className="rounded-lg bg-white border border-slate-200 p-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-slate-700 uppercase">En proceso</span>
                <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 rounded">3</span>
              </div>
              <MockTicket name="Ana Silva" channel="WhatsApp" preview="Perfecto, espero la guía de despacho" priority="normal" time="hace 1h" />
              <MockTicket name="Diego M." channel="Instagram" preview="¿Cuánto saldría con envío?" priority="high" time="hace 3h" />
            </div>

            {/* Columna 3 — Resueltos */}
            <div className="rounded-lg bg-white border border-slate-200 p-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-slate-700 uppercase">Resueltos</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 rounded">5</span>
              </div>
              <MockTicket name="Patricia G." channel="Email" preview="Gracias, todo perfecto" priority="low" time="hace 1d" muted />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockTicket({
  name,
  channel,
  preview,
  priority,
  time,
  muted,
}: {
  name: string;
  channel: string;
  preview: string;
  priority: "low" | "normal" | "high";
  time: string;
  muted?: boolean;
}) {
  const priorityColors = {
    low: "bg-slate-100 text-slate-600",
    normal: "bg-blue-50 text-blue-700",
    high: "bg-amber-50 text-amber-700",
  };
  return (
    <div className={`rounded-md border border-slate-200 p-2 mb-1.5 ${muted ? "opacity-60" : ""}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-semibold truncate">{name}</span>
        <span className="text-[9px] text-slate-400">{channel}</span>
      </div>
      <p className="text-[10px] text-slate-600 line-clamp-1">{preview}</p>
      <div className="flex items-center justify-between mt-1.5">
        <span className={`text-[9px] px-1 rounded ${priorityColors[priority]}`}>
          {priority === "high" ? "Alta" : priority === "low" ? "Baja" : "Normal"}
        </span>
        <span className="text-[9px] text-slate-400">{time}</span>
      </div>
    </div>
  );
}
