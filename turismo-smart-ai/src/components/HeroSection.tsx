import { ArrowDown, Bot, MapPin } from 'lucide-react';
import { useState } from 'react';
import { formatGuaranies, type TouristSite } from '../types';

interface HeroSectionProps {
  sites: TouristSite[];
  storageMode: 'supabase' | 'local';
}

export function HeroSection({ sites, storageMode }: HeroSectionProps) {
  const [imgError, setImgError] = useState(false);

  const museumCount = sites.filter((s) => s.tipo === 'Museo').length;
  const freeCount = sites.filter((s) => s.costo_entrada === 0).length;
  const minPaid = sites.reduce((min, s) => {
    if (s.costo_entrada > 0 && (min === 0 || s.costo_entrada < min)) {
      return s.costo_entrada;
    }
    return min;
  }, 0);

  return (
    <section id="inicio" className="border-b border-stone-200 bg-[#FAF9F6]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch">
          <div className="flex flex-col justify-between lg:col-span-6 lg:pr-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-stone-500">
                Colegio Nacional EMD Asunción Escalada · Segundo BTI
              </p>
              <h1 className="font-editorial mt-3 text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl text-balance leading-[1.1]">
                Patrimonio cultural, museos y rutas de Asunción
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-stone-600">
                Sistema dinámico de gestión turística con catálogo completo, búsqueda por tipo y presupuesto en guaraníes, cartografía interactiva en OpenStreetMap con exportación directa a Google Maps y asistente inteligente Gemini conectado a los registros reales.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a
                  href="#catalogo"
                  className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0"
                >
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                  <span>Explorar catálogo</span>
                </a>
                <a
                  href="#mapa"
                  className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-stone-800 hover:bg-stone-50 transition-colors whitespace-nowrap shrink-0"
                >
                  <MapPin className="h-4 w-4 text-[#1E3A8A]" aria-hidden="true" />
                  <span>Ver mapa OSM</span>
                </a>
                <a
                  href="#asistente"
                  className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-stone-800 hover:bg-stone-50 transition-colors whitespace-nowrap shrink-0"
                >
                  <Bot className="h-4 w-4 text-[#1E3A8A]" aria-hidden="true" />
                  <span>Consultar asistente</span>
                </a>
              </div>
            </div>

            <div className="mt-8 border-t border-stone-200 pt-4 text-xs text-stone-500">
              <span>Autora: Giménez Zárate, Constanza Milagros</span>
              <span className="mx-2" aria-hidden="true">·</span>
              <span>
                Base de datos: {storageMode === 'supabase' ? 'Supabase PostgreSQL' : 'Catálogo local sincronizable con Supabase'}
              </span>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col">
            <figure className="flex-1 flex flex-col">
              <div className="relative flex-1 min-h-[260px] lg:min-h-[360px] overflow-hidden rounded-xl border border-stone-200 bg-stone-200">
                {!imgError ? (
                  <img
                    src="/src/assets/images/hero_asuncion_patrimonio_1795639489543.jpg"
                    alt="Palacio de López y entorno cultural en Asunción, Paraguay"
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-200 to-stone-300 p-8 text-center">
                    <span className="font-editorial text-lg text-stone-700">
                      Patrimonio Cultural de Asunción
                    </span>
                  </div>
                )}
              </div>
              <figcaption className="mt-2.5 text-xs italic text-stone-500">
                Fig. 1 — Explanada histórica del Palacio de López y corredor cultural del centro de Asunción.
              </figcaption>
            </figure>
          </div>
        </div>

        {/* Franja operativa resumen (4 columnas) */}
        <div className="mt-10 grid grid-cols-2 gap-6 border-t border-stone-200 pt-7 lg:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-stone-500">Lugares registrados</p>
            <p className="font-mono-tabular mt-1 text-2xl font-semibold text-stone-900">
              {sites.length}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-stone-500">Museos y acceso gratuito</p>
            <p className="font-mono-tabular mt-1 text-2xl font-semibold text-stone-900">
              {museumCount} museos · {freeCount} gratis
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-stone-500">Entradas pagas desde</p>
            <p className="font-mono-tabular mt-1 text-2xl font-semibold text-stone-900">
              {minPaid > 0 ? formatGuaranies(minPaid) : 'Gratuito'}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-stone-500">Cartografía y ruta</p>
            <p className="mt-1 text-base font-medium text-stone-900">
              OpenStreetMap + Google Maps
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
