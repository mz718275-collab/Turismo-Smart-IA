import { Database, GitBranch, Globe, ShieldCheck } from 'lucide-react';

interface DeploymentSectionProps {
  storageMode: 'supabase' | 'local';
  geminiConfigured: boolean;
}

export function DeploymentSection({ storageMode, geminiConfigured }: DeploymentSectionProps) {
  return (
    <section id="arquitectura" className="border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-widest text-stone-500">
            Arquitectura y Publicación
          </p>
          <h2 className="font-editorial mt-2 text-2xl font-semibold text-stone-900 sm:text-3xl text-balance">
            Integración lista para Supabase, GitHub y Render
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-stone-600">
            Las credenciales privadas se administran exclusivamente mediante variables de entorno en el servidor sin exponerse en el navegador.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-stone-200 bg-[#FAF9F6] p-5">
            <Database className="h-5 w-5 text-[#1E3A8A]" aria-hidden="true" />
            <h3 className="mt-3 text-base font-semibold text-stone-900">Base de Datos Supabase</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
              Modo activo:{' '}
              <span className="font-medium text-stone-900">
                {storageMode === 'supabase' ? 'Conectado a Supabase' : 'Almacenamiento local activo'}
              </span>
              . Ejecuta <code className="font-mono-tabular text-xs">supabase/schema.sql</code> y define{' '}
              <code className="font-mono-tabular text-xs">SUPABASE_URL</code> y{' '}
              <code className="font-mono-tabular text-xs">SUPABASE_SERVICE_ROLE_KEY</code>.
            </p>
          </div>

          <div className="rounded-xl border border-stone-200 bg-[#FAF9F6] p-5">
            <Globe className="h-5 w-5 text-[#1E3A8A]" aria-hidden="true" />
            <h3 className="mt-3 text-base font-semibold text-stone-900">OpenStreetMap + Google Maps</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
              Visualización cartográfica libre con Leaflet y OpenStreetMap, con botones para abrir cada ubicación, trazar rutas multiparada o exportar archivos <code className="font-mono-tabular text-xs">.kml</code> hacia Google Maps.
            </p>
          </div>

          <div className="rounded-xl border border-stone-200 bg-[#FAF9F6] p-5">
            <ShieldCheck className="h-5 w-5 text-[#1E3A8A]" aria-hidden="true" />
            <h3 className="mt-3 text-base font-semibold text-stone-900">Asistente Gemini en Servidor</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
              Estado del modelo:{' '}
              <span className="font-medium text-stone-900">
                {geminiConfigured ? 'Disponible' : 'Pendiente de clave'}
              </span>
              . La ruta <code className="font-mono-tabular text-xs">/api/chat</code> consulta en vivo los registros reales antes de responder.
            </p>
          </div>

          <div className="rounded-xl border border-stone-200 bg-[#FAF9F6] p-5">
            <GitBranch className="h-5 w-5 text-[#1E3A8A]" aria-hidden="true" />
            <h3 className="mt-3 text-base font-semibold text-stone-900">GitHub y Render</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
              Incluye <code className="font-mono-tabular text-xs">render.yaml</code> para despliegue directo desde tu repositorio GitHub con compilación <code className="font-mono-tabular text-xs">npm run build</code> e inicio <code className="font-mono-tabular text-xs">npm start</code>.
            </p>
          </div>
        </div>
      </div>

      <footer className="border-t border-stone-200 bg-[#FAF9F6]">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            Turismo Smart AI · Proyecto Práctico Individual — Colegio Nacional EMD Asunción Escalada
          </p>
          <p>
            Alumna: Giménez Zárate, Constanza Milagros · Segundo Bachillerato Técnico en Informática
          </p>
        </div>
      </footer>
    </section>
  );
}
