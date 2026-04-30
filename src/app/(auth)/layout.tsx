import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Lado izquierdo: branding */}
      <div className="hidden lg:flex flex-col justify-between p-12 text-white relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, var(--primary) 0%, #082f49 50%, #0c4a6e 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)",
            backgroundSize: "60px 60px, 90px 90px",
          }}
        />

        <Link href="/" className="text-2xl font-bold tracking-tight relative z-10">
          ALLIN<span className="text-[var(--accent)]">CHILE</span>
        </Link>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Todo el negocio ordenado en una sola plataforma.
          </h1>
          <p className="text-lg text-white/80 max-w-md">
            Clientes, ventas, atención y seguimiento conectados en tiempo real.
            Pensado para empresas chilenas que quieren operar rápido y vender mejor.
          </p>
          <ul className="space-y-3 text-white/90">
            <li className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              Inbox multicanal: WhatsApp, email, redes
            </li>
            <li className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              CRM y pipelines visuales
            </li>
            <li className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              Copiloto IA para responder más rápido
            </li>
          </ul>
        </div>

        <p className="text-white/60 text-sm relative z-10">
          © {new Date().getFullYear()} ALLINCHILE
        </p>
      </div>

      {/* Lado derecho: formulario */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
