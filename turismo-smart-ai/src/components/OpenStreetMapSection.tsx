import L from 'leaflet';
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  MapPin,
  Navigation,
  Route,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  formatGuaranies,
  getGoogleMapsDirectionsUrl,
  getGoogleMapsRouteUrl,
  getGoogleMapsSearchUrl,
  type TouristSite,
} from '../types';

interface OpenStreetMapSectionProps {
  sites: TouristSite[];
  selectedSiteId: string | null;
  onSelectSite: (site: TouristSite) => void;
  routeSiteIds: string[];
  onToggleRouteSite: (id: string) => void;
  onClearRoute: () => void;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function createPinIcon(index: number, isSelected: boolean, isInRoute: boolean): L.DivIcon {
  const bg = isSelected ? '#1E3A8A' : isInRoute ? '#14532D' : '#1C1917';
  const size = isSelected ? 34 : 28;
  const ring = isSelected ? 'box-shadow: 0 0 0 4px rgba(30,58,138,0.25);' : '';

  return L.divIcon({
    className: 'custom-osm-marker',
    html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${bg};color:#ffffff;border:2px solid #ffffff;display:flex;align-items:center;justify-content:center;font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:600;${ring}cursor:pointer;">${index + 1}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

export function OpenStreetMapSection({
  sites,
  selectedSiteId,
  onSelectSite,
  routeSiteIds,
  onToggleRouteSite,
  onClearRoute,
}: OpenStreetMapSectionProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [copiedCoords, setCopiedCoords] = useState(false);

  const selectedSite = useMemo(
    () => sites.find((s) => s.id === selectedSiteId) ?? sites[0] ?? null,
    [sites, selectedSiteId]
  );

  const routeSites = useMemo(() => {
    const selected = sites.filter((s) => routeSiteIds.includes(s.id));
    return selected.length > 0 ? selected : sites;
  }, [sites, routeSiteIds]);

  // Inicializar mapa OpenStreetMap (Leaflet) una sola vez
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [-25.2804, -57.625],
      zoom: 13,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    markersLayerRef.current = layerGroup;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  // Actualizar marcadores cuando cambian los sitios, selección o ruta
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    sites.forEach((site, idx) => {
      const isSelected = selectedSite?.id === site.id;
      const isInRoute = routeSiteIds.includes(site.id);
      const marker = L.marker([site.latitud, site.longitud], {
        icon: createPinIcon(idx, isSelected, isInRoute),
      });

      const googleUrl = getGoogleMapsSearchUrl(site.latitud, site.longitud, site.nombre);
      const popupContainer = document.createElement('div');
      popupContainer.className = 'min-w-[210px] space-y-1.5 text-stone-900';

      const titleEl = document.createElement('p');
      titleEl.className = 'font-semibold text-sm leading-snug';
      titleEl.textContent = site.nombre;

      const metaEl = document.createElement('p');
      metaEl.className = 'text-xs text-stone-600';
      metaEl.textContent = `${site.tipo} · ${formatGuaranies(site.costo_entrada)}`;

      const addrEl = document.createElement('p');
      addrEl.className = 'text-xs text-stone-500';
      addrEl.textContent = site.direccion;

      const linkEl = document.createElement('a');
      linkEl.href = googleUrl;
      linkEl.target = '_blank';
      linkEl.rel = 'noopener noreferrer';
      linkEl.className =
        'inline-block pt-1 text-xs font-medium text-[#1E3A8A] underline underline-offset-2';
      linkEl.textContent = 'Abrir en Google Maps';

      popupContainer.appendChild(titleEl);
      popupContainer.appendChild(metaEl);
      popupContainer.appendChild(addrEl);
      popupContainer.appendChild(linkEl);

      marker.bindPopup(popupContainer);
      marker.on('click', () => {
        onSelectSite(site);
      });

      marker.addTo(layer);
    });

    if (sites.length > 0 && !selectedSiteId) {
      const bounds = L.latLngBounds(sites.map((s) => [s.latitud, s.longitud] as [number, number]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [sites, selectedSite?.id, selectedSiteId, routeSiteIds, onSelectSite]);

  // Centrar mapa suavemente al seleccionar un lugar
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedSiteId) return;
    const target = sites.find((s) => s.id === selectedSiteId);
    if (target) {
      map.setView([target.latitud, target.longitud], Math.max(map.getZoom(), 14), {
        animate: true,
      });
    }
  }, [selectedSiteId, sites]);

  const handleDownloadKml = () => {
    if (routeSites.length === 0) return;

    const placemarks = routeSites
      .map(
        (site) => `    <Placemark>
      <name>${escapeXml(site.nombre)}</name>
      <description>${escapeXml(
        `${site.tipo} | Entrada: ${formatGuaranies(site.costo_entrada)} | Horarios: ${site.horarios} | Dirección: ${site.direccion}`
      )}</description>
      <Point>
        <coordinates>${site.longitud},${site.latitud},0</coordinates>
      </Point>
    </Placemark>`
      )
      .join('\n');

    const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Turismo Smart AI - Ubicaciones</name>
    <description>Sitios turísticos, museos y espacios culturales exportados desde OpenStreetMap para importar en Google My Maps.</description>
${placemarks}
  </Document>
</kml>`;

    const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'turismo-smart-ai-google-maps.kml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyCoordinates = async () => {
    if (routeSites.length === 0) return;
    const text = routeSites
      .map(
        (s) =>
          `${s.nombre} (${s.latitud}, ${s.longitud}) -> ${getGoogleMapsSearchUrl(
            s.latitud,
            s.longitud,
            s.nombre
          )}`
      )
      .join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCoords(true);
      setTimeout(() => setCopiedCoords(false), 2500);
    } catch {
      setCopiedCoords(false);
    }
  };

  return (
    <section id="mapa" className="border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 border-b border-stone-200 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-stone-500">
              Cartografía Interactiva y Exportación
            </p>
            <h2 className="font-editorial mt-1.5 text-3xl font-semibold text-stone-900">
              Mapa OpenStreetMap con Paso Directo a Google Maps
            </h2>
          </div>
          <p className="text-sm text-stone-600">
            Haz clic en cualquier marcador numerado para consultar su ficha y abrirlo en Google Maps.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Mapa OpenStreetMap */}
          <div className="lg:col-span-8">
            <div className="overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
              <div
                ref={mapContainerRef}
                className="h-[420px] w-full sm:h-[500px]"
                aria-label="Mapa interactivo OpenStreetMap con ubicaciones turísticas"
              />
            </div>

            {/* Selector rápido de marcadores debajo del mapa */}
            {sites.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {sites.map((site, idx) => {
                  const active = selectedSite?.id === site.id;
                  return (
                    <button
                      key={site.id}
                      type="button"
                      onClick={() => onSelectSite(site)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? 'bg-[#1E3A8A] text-white'
                          : 'border border-stone-200 bg-[#FAF9F6] text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <span className="font-mono-tabular">{idx + 1}.</span>
                      <span className="max-w-[170px] truncate">{site.nombre}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Ficha del marcador seleccionado + Exportación a Google Maps */}
          <div className="flex flex-col gap-5 lg:col-span-4">
            {selectedSite ? (
              <div className="rounded-xl border border-stone-200 bg-[#FAF9F6] p-5">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span className="font-medium text-stone-800">{selectedSite.tipo}</span>
                  <span className="font-mono-tabular font-semibold text-[#1E3A8A]">
                    {formatGuaranies(selectedSite.costo_entrada)}
                  </span>
                </div>

                <h3 className="font-editorial mt-2 text-2xl font-semibold text-stone-900 leading-snug">
                  {selectedSite.nombre}
                </h3>

                <p className="mt-2.5 text-sm leading-relaxed text-stone-600">
                  {selectedSite.descripcion}
                </p>

                <dl className="mt-4 space-y-2 border-t border-stone-200 pt-3.5 text-xs text-stone-600">
                  <div>
                    <dt className="font-medium text-stone-900">Dirección</dt>
                    <dd>{selectedSite.direccion}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-stone-900">Horarios</dt>
                    <dd>{selectedSite.horarios}</dd>
                  </div>
                  {selectedSite.contacto && (
                    <div>
                      <dt className="font-medium text-stone-900">Contacto</dt>
                      <dd>{selectedSite.contacto}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="font-medium text-stone-900">Coordenadas (Lat, Lng)</dt>
                    <dd className="font-mono-tabular">
                      {selectedSite.latitud.toFixed(6)}, {selectedSite.longitud.toFixed(6)}
                    </dd>
                  </div>
                  {selectedSite.actividades.length > 0 && (
                    <div>
                      <dt className="font-medium text-stone-900">Actividades</dt>
                      <dd className="mt-1 space-y-0.5">
                        {selectedSite.actividades.map((act) => (
                          <div key={act}>· {act}</div>
                        ))}
                      </dd>
                    </div>
                  )}
                </dl>

                <div className="mt-5 flex flex-col gap-2">
                  <a
                    href={getGoogleMapsSearchUrl(
                      selectedSite.latitud,
                      selectedSite.longitud,
                      selectedSite.nombre
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1E3A8A] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#172D6E] transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    <span>Ver ubicación en Google Maps</span>
                  </a>

                  <a
                    href={getGoogleMapsDirectionsUrl(selectedSite.latitud, selectedSite.longitud)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50 transition-colors"
                  >
                    <Navigation className="h-4 w-4 text-[#1E3A8A]" aria-hidden="true" />
                    <span>Cómo llegar en Google Maps</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => onToggleRouteSite(selectedSite.id)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 cursor-pointer"
                  >
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>
                      {routeSiteIds.includes(selectedSite.id)
                        ? 'Quitar de la ruta multiparada'
                        : 'Incluir en ruta multiparada'}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-stone-200 bg-[#FAF9F6] p-6 text-sm text-stone-600">
                No hay ubicaciones visibles con los filtros actuales.
              </div>
            )}

            {/* Caja para transferir o exportar múltiples ubicaciones a Google Maps */}
            <div className="rounded-xl border border-stone-200 bg-white p-5">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold text-stone-900">
                  Pasar ubicaciones a Google Maps
                </h4>
                {routeSiteIds.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearRoute}
                    className="text-xs font-medium text-stone-500 hover:text-stone-900 cursor-pointer"
                  >
                    Limpiar selección
                  </button>
                )}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-stone-600">
                {routeSiteIds.length > 0
                  ? `${routeSiteIds.length} ${
                      routeSiteIds.length === 1 ? 'lugar seleccionado' : 'lugares seleccionados'
                    } para tu recorrido.`
                  : `Usando los ${sites.length} lugares visibles del catálogo para generar ruta o exportar.`}
              </p>

              <div className="mt-4 flex flex-col gap-2">
                <a
                  href={getGoogleMapsRouteUrl(routeSites)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-xs font-medium text-white hover:bg-stone-800 transition-colors ${
                    routeSites.length === 0 ? 'pointer-events-none opacity-40' : ''
                  }`}
                >
                  <Route className="h-4 w-4" aria-hidden="true" />
                  <span>Abrir circuito completo en Google Maps</span>
                </a>

                <button
                  type="button"
                  disabled={routeSites.length === 0}
                  onClick={handleDownloadKml}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-medium text-stone-800 hover:bg-stone-50 disabled:opacity-40 cursor-pointer"
                >
                  <Download className="h-4 w-4 text-[#1E3A8A]" aria-hidden="true" />
                  <span>Descargar archivo .KML (Google My Maps)</span>
                </button>

                <button
                  type="button"
                  disabled={routeSites.length === 0}
                  onClick={handleCopyCoordinates}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-medium text-stone-800 hover:bg-stone-50 disabled:opacity-40 cursor-pointer"
                >
                  {copiedCoords ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                      <span>Enlaces y coordenadas copiados</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-stone-500" aria-hidden="true" />
                      <span>Copiar coordenadas y enlaces Google Maps</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
