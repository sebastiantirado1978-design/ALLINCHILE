# ALLINCHILE

> Plataforma SaaS de gestión comercial, atención al cliente y automatización para empresas chilenas — desde PyMES hasta grandes industrias.

**Estado:** 🚧 En desarrollo activo (MVP semana 1)

---

## ✨ Qué incluye

- **Inbox multicanal** estilo Kanban (WhatsApp, email, Instagram, web chat)
- **CRM** con pipelines arrastrables y oportunidades
- **Contactos** con identidad unificada cross-canal
- **Tareas** con vencimientos, prioridades y asignación
- **Reportes** en tiempo real con gráficos
- **Copiloto IA** (Claude) para asistir respuestas
- **Multi-tenant** desde día 1 (vendible a 500+ clientes)
- **Auditoría** automática de cambios
- **Roles** Owner / Admin / Manager / Agent / Viewer

## 🛠 Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript + Tailwind CSS |
| UI | shadcn/ui + Lucide icons |
| Backend | Next.js Server Actions + API Routes |
| DB | PostgreSQL (Supabase) con Row Level Security |
| Auth | Supabase Auth (email + magic link) |
| Storage | Supabase Storage |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| State | Zustand (mínimo) |
| AI | Anthropic Claude SDK |
| Deploy | Vercel + Supabase |

---

## 🚀 Setup local

### 1. Requisitos

- Node.js 20+
- Cuenta gratuita en [Supabase](https://supabase.com)
- (Opcional) Cuenta en [Anthropic](https://console.anthropic.com) para copiloto IA

### 2. Instalación

```bash
git clone <este-repo>
cd allinchile
npm install
cp .env.example .env.local
```

### 3. Configurar Supabase

1. Crea un proyecto nuevo en [app.supabase.com](https://app.supabase.com).
2. Ve a **Settings → API** y copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
3. Pega los valores en `.env.local`.
4. Ve a **SQL Editor** y ejecuta el contenido de `supabase/migrations/0001_initial.sql`.
5. (Opcional) Ejecuta `supabase/seed.sql` reemplazando `:org_id` por el UUID de tu organización demo.

### 4. Levantar la app

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## 📁 Estructura del proyecto

```
allinchile/
├── src/
│   ├── app/
│   │   ├── (auth)/            # Login, signup
│   │   ├── (app)/             # App autenticada (sidebar layout)
│   │   │   ├── dashboard/
│   │   │   ├── contacts/
│   │   │   ├── inbox/
│   │   │   ├── deals/
│   │   │   ├── tasks/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   └── api/               # API routes (webhooks, IA)
│   ├── components/
│   │   ├── ui/                # Componentes base
│   │   ├── app/               # Sidebar, topbar, etc.
│   │   └── shared/            # Reutilizables
│   ├── lib/
│   │   ├── supabase/          # Clients (browser/server/middleware)
│   │   ├── validations/       # Schemas Zod
│   │   └── utils.ts
│   ├── server/
│   │   ├── actions/           # Server Actions
│   │   └── queries/           # Lecturas de DB
│   └── types/
│       └── database.types.ts  # Generado por Supabase CLI
├── supabase/
│   ├── migrations/
│   └── seed.sql
├── docs/                      # Documentación funcional
└── public/
```

---

## 🔌 Integraciones externas

| Integración | Estado | Setup |
|---|---|---|
| WhatsApp Business API | Preparado | Requiere cuenta Meta Business + número aprobado |
| Email (Resend) | Preparado | API key en `.env.local` |
| Shopify | Preparado | OAuth en Settings → Integrations |
| HubSpot | Preparado | OAuth en Settings → Integrations |
| Salesforce | Roadmap | — |

Mientras no haya credenciales, los botones de WhatsApp abren `wa.me/[telefono]?text=[msg]` (link directo, sin API) y los de email usan `mailto:`.

---

## 🗺 Roadmap MVP (4 semanas)

- **Semana 1** ✅ Setup + Auth + Dashboard + Contactos
- **Semana 2** Inbox/Tickets multicanal + Tareas
- **Semana 3** CRM + Pipelines arrastrables + Reportes
- **Semana 4** Configuración + Roles + Copiloto IA + Hardening

---

## 🧪 Checklist de calidad

Antes de considerar una feature lista:

- [ ] Sin botones decorativos (todos ejecutan acción real)
- [ ] Sin rutas rotas
- [ ] Sin errores en consola
- [ ] Formularios validados con Zod
- [ ] Persistencia real en Supabase
- [ ] Filtros y búsqueda funcionales
- [ ] Responsive en desktop / tablet / móvil
- [ ] RLS aplicado y probado con 2 organizaciones distintas
- [ ] Audit log se escribe en cambios importantes

---

## 📝 Licencia

Propiedad de Sebastián Tirado. Todos los derechos reservados.
