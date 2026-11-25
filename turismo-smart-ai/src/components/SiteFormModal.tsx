import L from 'leaflet';
import { MapPin, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  CURATED_IMAGES,
  SITE_CATEGORIES,
  type SiteCategory,
  type SiteInput,
  type TouristSite,
} from '../types';

interface SiteFormModalProps {
  isOpen: boolean;
  editingSite: TouristSite | null;
  onClose: () => void;
  onSubmit: (data: SiteInput, editingId?: string) => Promise<void>;
}

export function SiteFormModal({
  isOpen,
  editingSite,
  onClose,
  onSubmit,
}: SiteFormModalProps) {
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<SiteCategory>('Museo');
  const [descripcion, setDescripcion] = useState('');
  const [direccion, setDireccion] = useState('');
  const [contacto, setContacto] = useState('');
  const [horarios, setHorarios] = useState('');
  const [costoEntrada, setCostoEntrada] = useState('0');
  const [actividadesText, setActividadesText] = useState('');
  const [latitud, setLatitud] = useState('-25.2821');
  const [longitud, setLongitud] = useState('-57.6352');
  const [imagenUrl, setImagenUrl] = useState(CURATED_IMAGES[1].url);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const pickerMapRef = useRef<HTMLDivElement | null>(null);
  const pickerInstanceRef = useRef<L.Map | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setFormError(null);

    if (editingSite) {
      setNombre(editingSite.nombre);
      setTipo(editingSite.tipo);
      setDescripcion(editingSite.descripcion);
      setDireccion(editingSite.direccion);
      setContacto(editingSite.contacto);
      setHorarios(editingSite.horarios);
      setCostoEntrada(String(editingSite.costo_entrada));
      setActividadesText(editingSite.actividades.join(', '));
      setLatitud(String(editingSite.latitud));
      setLongitud(String(editingSite.longitud));
      setImagenUrl(editingSite.imagen_url || CURATED_IMAGES[0].url);
    } else {
      setNombre('');
      setTipo('Museo');
      setDescripcion('');
      setDireccion('');
      setContacto('');
      setHorarios('Martes a domingo de 09:00 a 18:00');
      setCostoEntrada('0');
      setActividadesText('Visita guiada, Recorrido cultural');
      setLatitud('-25.2821');
      setLongitud('-57.6352');
      setImagenUrl(CURATED_IMAGES[1].url);
    }
  }, [isOpen, editingSite]);

  // Inicializar mini mapa selector de coordenadas OpenStreetMap
  useEffect(() => {
    if (!isOpen || !pickerMapRef.current) return;

    const initialLat = Number(latitud) || -25.2821;
    const initialLng = Number(longitud) || -57.6352;

    const map = L.map(pickerMapRef.current, {
      center: [initialLat, initialLng],
      zoom: 13,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    const pinIcon = L.divIcon({
      className: 'picker-osm-pin',
      html: `<div style="width:24px;height:24px;border-radius:9999px;background:#1E3A8A;border:3px solid #ffffff;box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const marker = L.marker([initialLat, initialLng], { icon: pinIcon }).addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      const clickedLat = Number(e.latlng.lat.toFixed(6));
      const clickedLng = Number(e.latlng.lng.toFixed(6));
      marker.setLatLng([clickedLat, clickedLng]);
      setLatitud(String(clickedLat));
      setLongitud(String(clickedLng));
    });

    pickerInstanceRef.current = map;
    pickerMarkerRef.current = marker;

    setTimeout(() => {
      map.invalidateSize();
    }, 120);

    return () => {
      map.remove();
      pickerInstanceRef.current = null;
      pickerMarkerRef.current = null;
    };
  }, [isOpen]);

  // Sincronizar marcador del mini mapa si el usuario edita lat/lng manualmente
  useEffect(() => {
    const map = pickerInstanceRef.current;
    const marker = pickerMarkerRef.current;
    if (!map || !marker) return;

    const latNum = Number(latitud);
    const lngNum = Number(longitud);
    if (
      Number.isFinite(latNum) &&
      Number.isFinite(lngNum) &&
      latNum >= -90 &&
      latNum <= 90 &&
      lngNum >= -180 &&
      lngNum <= 180
    ) {
      marker.setLatLng([latNum, lngNum]);
    }
  }, [latitud, longitud]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const latNum = Number(latitud);
    const lngNum = Number(longitud);
    const costoNum = Number(costoEntrada);

    if (!nombre.trim() || !direccion.trim() || !horarios.trim()) {
      setFormError('Completa nombre, dirección y horarios antes de guardar.');
      return;
    }
    if (!Number.isFinite(latNum) || latNum < -90 || latNum > 90) {
      setFormError('Ingresa una latitud válida entre -90 y 90.');
      return;
    }
    if (!Number.isFinite(lngNum) || lngNum < -180 || lngNum > 180) {
      setFormError('Ingresa una longitud válida entre -180 y 180.');
      return;
    }
    if (!Number.isFinite(costoNum) || costoNum < 0) {
      setFormError('El costo de entrada debe ser 0 o mayor en Guaraníes.');
      return;
    }

    const actividades = actividadesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: SiteInput = {
      nombre: nombre.trim(),
      tipo,
      descripcion: descripcion.trim(),
      direccion: direccion.trim(),
      contacto: contacto.trim(),
      latitud: latNum,
      longitud: lngNum,
      actividades,
      horarios: horarios.trim(),
      costo_entrada: Math.round(costoNum),
      imagen_url: imagenUrl.trim(),
    };

    setSubmitting(true);
    try {
      await onSubmit(payload, editingSite?.id);
      onClose();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo guardar el registro.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="site-modal-title"
    >
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-stone-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200 bg-white px-6 py-4">
          <div>
            <h2 id="site-modal-title" className="font-editorial text-2xl font-semibold text-stone-900">
              {editingSite ? 'Modificar sitio registrado' : 'Registrar nuevo sitio'}
            </h2>
            <p className="text-xs text-stone-500">
              Los cambios se guardan directamente en la base de datos y actualizan el mapa y el asistente.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar formulario"
            className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-900 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {formError && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
            >
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="site-nombre" className="block text-xs font-medium text-stone-700">
                Nombre del sitio o museo *
              </label>
              <input
                id="site-nombre"
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Centro Cultural de la República El Cabildo"
                className="mt-1.5 w-full rounded-lg border border-stone-300 px-3.5 py-2 text-sm text-stone-900 focus:border-[#1E3A8A] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="site-tipo" className="block text-xs font-medium text-stone-700">
                Tipo de atractivo *
              </label>
              <select
                id="site-tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as SiteCategory)}
                className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm text-stone-900 focus:border-[#1E3A8A] focus:outline-none"
              >
                {SITE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="site-descripcion" className="block text-xs font-medium text-stone-700">
              Descripción del atractivo
            </label>
            <textarea
              id="site-descripcion"
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Reseña cultural, histórica o turística del lugar..."
              className="mt-1.5 w-full rounded-lg border border-stone-300 px-3.5 py-2 text-sm text-stone-900 focus:border-[#1E3A8A] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="site-direccion" className="block text-xs font-medium text-stone-700">
                Dirección exacta *
              </label>
              <input
                id="site-direccion"
                type="text"
                required
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Ej. Av. República y Alberdi, Asunción"
                className="mt-1.5 w-full rounded-lg border border-stone-300 px-3.5 py-2 text-sm text-stone-900 focus:border-[#1E3A8A] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="site-contacto" className="block text-xs font-medium text-stone-700">
                Contacto (teléfono / web)
              </label>
              <input
                id="site-contacto"
                type="text"
                value={contacto}
                onChange={(e) => setContacto(e.target.value)}
                placeholder="Ej. +595 21 443 094 · cabildoccr.gov.py"
                className="mt-1.5 w-full rounded-lg border border-stone-300 px-3.5 py-2 text-sm text-stone-900 focus:border-[#1E3A8A] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="site-horarios" className="block text-xs font-medium text-stone-700">
                Horarios de atención *
              </label>
              <input
                id="site-horarios"
                type="text"
                required
                value={horarios}
                onChange={(e) => setHorarios(e.target.value)}
                placeholder="Ej. Martes a domingo de 09:00 a 18:00"
                className="mt-1.5 w-full rounded-lg border border-stone-300 px-3.5 py-2 text-sm text-stone-900 focus:border-[#1E3A8A] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="site-costo" className="block text-xs font-medium text-stone-700">
                Costo de entrada en Guaraníes (0 = Gratuito) *
              </label>
              <input
                id="site-costo"
                type="number"
                min={0}
                step={1000}
                required
                value={costoEntrada}
                onChange={(e) => setCostoEntrada(e.target.value)}
                className="font-mono-tabular mt-1.5 w-full rounded-lg border border-stone-300 px-3.5 py-2 text-sm text-stone-900 focus:border-[#1E3A8A] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="site-actividades" className="block text-xs font-medium text-stone-700">
              Actividades disponibles (separadas por coma)
            </label>
            <input
              id="site-actividades"
              type="text"
              value={actividadesText}
              onChange={(e) => setActividadesText(e.target.value)}
              placeholder="Ej. Visita guiada, Exposiciones temporales, Fotografía"
              className="mt-1.5 w-full rounded-lg border border-stone-300 px-3.5 py-2 text-sm text-stone-900 focus:border-[#1E3A8A] focus:outline-none"
            />
          </div>

          {/* Selector de imagen */}
          <div>
            <label htmlFor="site-imagen" className="block text-xs font-medium text-stone-700">
              Fotografía de referencia
            </label>
            <select
              id="site-imagen"
              value={imagenUrl}
              onChange={(e) => setImagenUrl(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm text-stone-900 focus:border-[#1E3A8A] focus:outline-none"
            >
              {CURATED_IMAGES.map((img) => (
                <option key={img.url} value={img.url}>
                  {img.label}
                </option>
              ))}
            </select>
          </div>

          {/* Coordenadas con selector interactivo OpenStreetMap */}
          <div className="rounded-xl border border-stone-200 bg-[#FAF9F6] p-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-900">
                <MapPin className="h-4 w-4 text-[#1E3A8A]" aria-hidden="true" />
                <span>Ubicación geográfica (haz clic en el mapa OpenStreetMap)</span>
              </div>
              <span className="font-mono-tabular text-xs text-stone-500">
                {latitud}, {longitud}
              </span>
            </div>

            <div
              ref={pickerMapRef}
              className="mt-3 h-48 w-full overflow-hidden rounded-lg border border-stone-300"
            />

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="site-lat" className="block text-xs font-medium text-stone-700">
                  Latitud *
                </label>
                <input
                  id="site-lat"
                  type="number"
                  step="any"
                  required
                  value={latitud}
                  onChange={(e) => setLatitud(e.target.value)}
                  className="font-mono-tabular mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-900 focus:border-[#1E3A8A] focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="site-lng" className="block text-xs font-medium text-stone-700">
                  Longitud *
                </label>
                <input
                  id="site-lng"
                  type="number"
                  step="any"
                  required
                  value={longitud}
                  onChange={(e) => setLongitud(e.target.value)}
                  className="font-mono-tabular mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-900 focus:border-[#1E3A8A] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-stone-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[#1E3A8A] px-5 py-2 text-sm font-medium text-white hover:bg-[#172D6E] disabled:opacity-50 cursor-pointer"
            >
              {submitting
                ? 'Guardando...'
                : editingSite
                  ? 'Guardar cambios'
                  : 'Registrar sitio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
