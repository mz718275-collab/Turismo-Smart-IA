import {
  CheckSquare,
  ExternalLink,
  MapPin,
  Pencil,
  Search,
  Square,
  Trash2,
  X,
} from 'lucide-react';
import { useState } from 'react';
import {
  SITE_CATEGORIES,
  formatGuaranies,
  getGoogleMapsSearchUrl,
  type SiteCategory,
  type TouristSite,
} from '../types';

interface CatalogSectionProps {
  sites: TouristSite[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: 'Todos' | SiteCategory;
  onCategoryChange: (cat: 'Todos' | SiteCategory) => void;
  maxBudget: string;
  onMaxBudgetChange: (val: string) => void;
  selectedSiteId: string | null;
  onSelectOnMap: (site: TouristSite) => void;
  routeSiteIds: string[];
  onToggleRouteSite: (id: string) => void;
  onEditSite: (site: TouristSite) => void;
  onDeleteSite: (id: string) => Promise<void>;
  onResetFilters: () => void;
}

const BUDGET_PRESETS = [
  { label: 'Cualquier costo', value: '' },
  { label: 'Gratuito (0 Gs.)', value: '0' },
  { label: 'Hasta 20.000 Gs.', value: '20000' },
  { label: 'Hasta 50.000 Gs.', value: '50000' },
  { label: 'Hasta 100.000 Gs.', value: '100000' },
];

function SiteCardImage({ src, alt, tipo }: { src: string; alt: string; tipo: string }) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 p-4 text-center">
        <MapPin className="h-6 w-6 text-stone-400" aria-hidden="true" />
        <span className="mt-2 text-xs font-medium text-stone-600">{tipo}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
    />
  );
}

export function CatalogSection({
  sites,
  loading,
  error,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  maxBudget,
  onMaxBudgetChange,
  selectedSiteId,
  onSelectOnMap,
  routeSiteIds,
  onToggleRouteSite,
  onEditSite,
  onDeleteSite,
  onResetFilters,
}: CatalogSectionProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleConfirmDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDeleteSite(id);
      setConfirmDeleteId(null);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section id="catalogo" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 border-b border-stone-200 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-stone-500">
            Archivo y Registro de Atractivos
          </p>
          <h2 className="font-editorial mt-1.5 text-3xl font-semibold text-stone-900">
            Catálogo de Sitios, Museos y Espacios Culturales
          </h2>
        </div>
        <p className="font-mono-tabular text-sm text-stone-500">
          {sites.length} {sites.length === 1 ? 'resultado visible' : 'resultados visibles'}
        </p>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="mt-6 space-y-4 rounded-xl border border-stone-200 bg-white p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <label htmlFor="catalog-search" className="sr-only">
              Buscar sitios turísticos, actividades o dirección
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                aria-hidden="true"
              />
              <input
                id="catalog-search"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar por nombre, actividad, museo o dirección..."
                className="w-full rounded-lg border border-stone-300 bg-[#FAF9F6] py-2.5 pl-10 pr-9 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#1E3A8A] focus:bg-white focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <label
              htmlFor="budget-input"
              className="text-xs font-medium text-stone-600 whitespace-nowrap shrink-0"
            >
              Presupuesto máx. (Gs.):
            </label>
            <input
              id="budget-input"
              type="number"
              min={0}
              step={5000}
              value={maxBudget}
              onChange={(e) => onMaxBudgetChange(e.target.value)}
              placeholder="Ej. 50000"
              className="font-mono-tabular w-full rounded-lg border border-stone-300 bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#1E3A8A] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Filtros por tipo de atractivo y atajos de presupuesto */}
        <div className="flex flex-col gap-3 border-t border-stone-100 pt-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filtrar por tipo de atractivo">
            {(['Todos', ...SITE_CATEGORIES] as const).map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onCategoryChange(cat)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Atajos de presupuesto">
            {BUDGET_PRESETS.map((preset) => {
              const active = maxBudget === preset.value;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onMaxBudgetChange(preset.value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#1E3A8A] text-white'
                      : 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Estados de carga y error */}
      {error && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-96 animate-pulse rounded-xl border border-stone-200 bg-white p-5"
            >
              <div className="h-44 rounded-lg bg-stone-200" />
              <div className="mt-4 h-4 w-1/2 rounded bg-stone-200" />
              <div className="mt-3 h-6 w-3/4 rounded bg-stone-200" />
              <div className="mt-3 h-16 rounded bg-stone-100" />
            </div>
          ))}
        </div>
      ) : sites.length === 0 ? (
        <div className="mt-8 rounded-xl border border-stone-200 bg-white p-10 text-center">
          <p className="font-editorial text-xl text-stone-900">
            No se encontraron atractivos con esos criterios
          </p>
          <p className="mt-2 text-sm text-stone-600">
            Prueba ampliando el presupuesto en guaraníes o seleccionando otra categoría.
          </p>
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-5 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 cursor-pointer"
          >
            Restablecer filtros
          </button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => {
            const isSelected = site.id === selectedSiteId;
            const inRoute = routeSiteIds.includes(site.id);
            const isConfirmingDelete = confirmDeleteId === site.id;

            return (
              <article
                key={site.id}
                className={`group flex flex-col justify-between overflow-hidden rounded-xl border bg-white transition-colors ${
                  isSelected
                    ? 'border-[#1E3A8A] ring-1 ring-[#1E3A8A]'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div>
                  <div className="aspect-[4/3] w-full overflow-hidden border-b border-stone-100 bg-stone-100">
                    <SiteCardImage
                      src={site.imagen_url}
                      alt={site.nombre}
                      tipo={site.tipo}
                    />
                  </div>

                  <div className="p-5">
                    {/* Metadata sin cápsulas/pills, solo texto limpio con separadores */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-500">
                      <span className="font-medium text-stone-800">{site.tipo}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-tabular font-medium text-[#1E3A8A]">
                        {formatGuaranies(site.costo_entrada)}
                      </span>
                    </div>

                    <h3 className="font-editorial mt-2 text-xl font-semibold text-stone-900 leading-snug">
                      {site.nombre}
                    </h3>

                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-stone-600">
                      {site.descripcion || 'Sin descripción registrada.'}
                    </p>

                    <dl className="mt-4 space-y-2 border-t border-stone-100 pt-3.5 text-xs text-stone-600">
                      <div>
                        <dt className="inline font-medium text-stone-800">Horarios: </dt>
                        <dd className="inline">{site.horarios}</dd>
                      </div>
                      <div>
                        <dt className="inline font-medium text-stone-800">Dirección: </dt>
                        <dd className="inline">{site.direccion}</dd>
                      </div>
                      {site.contacto && (
                        <div>
                          <dt className="inline font-medium text-stone-800">Contacto: </dt>
                          <dd className="inline">{site.contacto}</dd>
                        </div>
                      )}
                      {site.actividades.length > 0 && (
                        <div>
                          <dt className="font-medium text-stone-800">Actividades:</dt>
                          <dd className="mt-1 text-stone-600">
                            {site.actividades.slice(0, 3).join(' · ')}
                          </dd>
                        </div>
                      )}
                      <div>
                        <dt className="inline font-medium text-stone-800">Coordenadas: </dt>
                        <dd className="font-mono-tabular inline text-stone-500">
                          {site.latitud.toFixed(4)}, {site.longitud.toFixed(4)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {/* Pie de acciones */}
                <div className="border-t border-stone-100 bg-[#FAF9F6] px-5 py-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleRouteSite(site.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 cursor-pointer"
                    >
                      {inRoute ? (
                        <CheckSquare className="h-4 w-4 text-[#1E3A8A]" aria-hidden="true" />
                      ) : (
                        <Square className="h-4 w-4 text-stone-400" aria-hidden="true" />
                      )}
                      <span>{inRoute ? 'En ruta Google Maps' : 'Añadir a ruta'}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectOnMap(site)}
                        className="inline-flex items-center gap-1 rounded-md border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-800 hover:bg-stone-50 whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <MapPin className="h-3.5 w-3.5 text-[#1E3A8A]" aria-hidden="true" />
                        <span>Mapa</span>
                      </button>

                      <a
                        href={getGoogleMapsSearchUrl(site.latitud, site.longitud, site.nombre)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-800 hover:bg-stone-50 whitespace-nowrap shrink-0"
                        title="Abrir ubicación en Google Maps"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-stone-600" aria-hidden="true" />
                        <span>Google Maps</span>
                      </a>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-end gap-2 border-t border-stone-200/70 pt-2.5">
                    {!isConfirmingDelete ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onEditSite(site)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-stone-700 hover:text-stone-900 cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Editar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(site.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 hover:text-red-900 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Eliminar</span>
                        </button>
                      </>
                    ) : (
                      <div className="flex w-full items-center justify-between gap-2 text-xs">
                        <span className="font-medium text-red-800">¿Eliminar registro?</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="rounded px-2 py-1 text-stone-600 hover:bg-stone-200 cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === site.id}
                            onClick={() => handleConfirmDelete(site.id)}
                            className="rounded bg-red-700 px-2.5 py-1 font-medium text-white hover:bg-red-800 disabled:opacity-50 cursor-pointer"
                          >
                            {deletingId === site.id ? 'Eliminando...' : 'Confirmar'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
