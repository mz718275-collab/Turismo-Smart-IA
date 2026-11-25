export type SiteCategory =
  | 'Museo'
  | 'Sitio Turístico'
  | 'Espacio Cultural'
  | 'Parque y Naturaleza'
  | 'Patrimonio Histórico';

export const SITE_CATEGORIES: SiteCategory[] = [
  'Museo',
  'Sitio Turístico',
  'Espacio Cultural',
  'Parque y Naturaleza',
  'Patrimonio Histórico',
];

export interface TouristSite {
  id: string;
  nombre: string;
  tipo: SiteCategory;
  descripcion: string;
  direccion: string;
  contacto: string;
  latitud: number;
  longitud: number;
  actividades: string[];
  horarios: string;
  costo_entrada: number;
  imagen_url: string;
  created_at?: string;
}

export interface SiteInput {
  nombre: string;
  tipo: SiteCategory;
  descripcion: string;
  direccion: string;
  contacto: string;
  latitud: number;
  longitud: number;
  actividades: string[];
  horarios: string;
  costo_entrada: number;
  imagen_url?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface SystemStatus {
  storageMode: 'supabase' | 'local';
  geminiConfigured: boolean;
  totalSites: number;
}

export const CURATED_IMAGES = [
  {
    label: 'Palacio de Gobierno / Patrimonio',
    url: '/src/assets/images/hero_asuncion_patrimonio_1795639489543.jpg',
  },
  {
    label: 'Galería de Museo',
    url: '/src/assets/images/site_museo_barro_1795639490316.jpg',
  },
  {
    label: 'Monumento Neoclásico',
    url: '/src/assets/images/site_panteon_heroes_1795639490670.jpg',
  },
  {
    label: 'Patio Colonial / Espacio Cultural',
    url: '/src/assets/images/site_manzana_rivera_1795639490452.jpg',
  },
  {
    label: 'Jardín Botánico y Naturaleza',
    url: '/src/assets/images/site_jardin_botanico_1795639489377.jpg',
  },
];

export function formatGuaranies(amount: number): string {
  if (!amount || amount <= 0) {
    return 'Gratuito';
  }
  return `${new Intl.NumberFormat('es-PY').format(amount)} Gs.`;
}

export function getGoogleMapsSearchUrl(lat: number, lng: number, label?: string): string {
  const query = encodeURIComponent(`${lat},${lng}`);
  if (label) {
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function getGoogleMapsDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function getGoogleMapsRouteUrl(sites: TouristSite[]): string {
  if (sites.length === 0) return 'https://www.google.com/maps';
  if (sites.length === 1) {
    return getGoogleMapsSearchUrl(sites[0].latitud, sites[0].longitud, sites[0].nombre);
  }
  const stops = sites.slice(0, 10).map((s) => `${s.latitud},${s.longitud}`).join('/');
  return `https://www.google.com/maps/dir/${stops}`;
}
