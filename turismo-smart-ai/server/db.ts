import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { SITE_CATEGORIES, type SiteCategory, type SiteInput, type TouristSite } from '../src/types.ts';

const TABLE_NAME = 'sitios_turisticos';
const DATA_DIR = path.resolve(process.cwd(), 'data');
const LOCAL_DB_PATH = path.resolve(DATA_DIR, 'sitios_turisticos.json');

export const INITIAL_SITES: Omit<TouristSite, 'id' | 'created_at'>[] = [
  {
    nombre: 'Museo del Barro (Centro de Artes Visuales)',
    tipo: 'Museo',
    descripcion:
      'Referente fundamental del arte popular, indígena y contemporáneo del Paraguay, con valiosas colecciones de cerámica, tallas en madera y textiles tradicionales.',
    direccion: 'Grabadores del Cabichuí 2716, Asunción',
    contacto: '+595 21 607 996 · museodelbarro.org',
    latitud: -25.2842,
    longitud: -57.5624,
    actividades: [
      'Recorrido por cerámica indígena y popular',
      'Galería de arte contemporáneo',
      'Visita guiada patrimonial',
    ],
    horarios: 'Martes a sábado de 14:00 a 20:00',
    costo_entrada: 50000,
    imagen_url: '/src/assets/images/site_museo_barro_1795639490316.jpg',
  },
  {
    nombre: 'Panteón Nacional de los Héroes',
    tipo: 'Patrimonio Histórico',
    descripcion:
      'Monumento arquitectónico neoclásico en el corazón de Asunción donde descansan los restos de los principales próceres y héroes de la historia paraguaya.',
    direccion: 'Palma y Chile, Centro Histórico, Asunción',
    contacto: '+595 21 445 700 · cultura.gov.py',
    latitud: -25.2821,
    longitud: -57.6352,
    actividades: [
      'Cambio de guardia de honor',
      'Visita arquitectónica neoclásica',
      'Recorrido histórico guiado',
    ],
    horarios: 'Lunes a domingo de 08:00 a 18:00',
    costo_entrada: 0,
    imagen_url: '/src/assets/images/site_panteon_heroes_1795639490670.jpg',
  },
  {
    nombre: 'Centro Cultural Manzana de la Rivera',
    tipo: 'Espacio Cultural',
    descripcion:
      'Complejo arquitectónico compuesto por nueve casas coloniales y republicanas restauradas frente al Palacio de López, sede de museos, bibliotecas y exposiciones.',
    direccion: 'Ayolas 129 c/ Benjamín Constant, Asunción',
    contacto: '+595 21 442 448 · asuncion.gov.py',
    latitud: -25.2804,
    longitud: -57.6383,
    actividades: [
      'Exposiciones de arte y fotografía',
      'Museo Memoria de la Ciudad',
      'Biblioteca y ciclos de cine',
    ],
    horarios: 'Lunes a viernes de 08:30 a 20:00 · Sábados 09:00 a 17:00',
    costo_entrada: 0,
    imagen_url: '/src/assets/images/site_manzana_rivera_1795639490452.jpg',
  },
  {
    nombre: 'Palacio de López y Explanada Litoral',
    tipo: 'Sitio Turístico',
    descripcion:
      'Sede oficial del Gobierno nacional con arquitectura ecléctica de mediados del siglo XIX, jardines abiertos y vista directa a la Bahía de Asunción.',
    direccion: "El Paraguayo Independiente y O'Leary, Asunción",
    contacto: '+595 21 414 0000 · presidencia.gov.py',
    latitud: -25.2775,
    longitud: -57.6378,
    actividades: [
      'Fotografía de fachada iluminada',
      'Paseo por la explanada y Costanera',
      'Recorrido histórico exterior',
    ],
    horarios: 'Explanada abierta todos los días · Visitas internas con reserva',
    costo_entrada: 0,
    imagen_url: '/src/assets/images/hero_asuncion_patrimonio_1795639489543.jpg',
  },
  {
    nombre: 'Museo Casa de la Independencia',
    tipo: 'Museo',
    descripcion:
      'Casona colonial de 1772 donde se gestó la independencia del Paraguay en mayo de 1811. Conserva mobiliario original, documentos y el histórico callejón.',
    direccion: '14 de Mayo esq. Presidente Franco, Asunción',
    contacto: '+595 21 493 918 · casadelaindependencia.org.py',
    latitud: -25.2809,
    longitud: -57.6374,
    actividades: [
      'Sala Capitular y mobiliario de época',
      'Visita guiada sobre la gesta de mayo de 1811',
      'Archivo documental histórico',
    ],
    horarios: 'Martes a viernes de 08:00 a 17:00 · Sábados 08:00 a 12:00',
    costo_entrada: 10000,
    imagen_url: '/src/assets/images/site_manzana_rivera_1795639490452.jpg',
  },
  {
    nombre: 'Jardín Botánico y Museo de Historia Natural',
    tipo: 'Parque y Naturaleza',
    descripcion:
      'Extenso pulmón verde de Asunción que alberga senderos de flora nativa, palmares, antiguos caserones históricos y colecciones de ciencias naturales.',
    direccion: 'Av. Primer Presidente y Artigas, Trinidad, Asunción',
    contacto: '+595 21 290 807 · asuncion.gov.py',
    latitud: -25.2536,
    longitud: -57.5718,
    actividades: [
      'Senderismo bajo lapachos y palmares',
      'Visita al Museo de Historia Natural',
      'Avistamiento de flora y fauna nativa',
    ],
    horarios: 'Martes a domingo de 07:00 a 17:00',
    costo_entrada: 15000,
    imagen_url: '/src/assets/images/site_jardin_botanico_1795639489377.jpg',
  },
  {
    nombre: 'Museo Nacional de Bellas Artes (MNBA)',
    tipo: 'Museo',
    descripcion:
      'Institución emblemática dedicada a la conservación y difusión de pinturas, esculturas y grabados de artistas paraguayos e internacionales.',
    direccion: "Eligio Ayala 1345 e/ Pa'i Pérez y Curupayty, Asunción",
    contacto: '+595 21 211 664 · cultura.gov.py',
    latitud: -25.2869,
    longitud: -57.6241,
    actividades: [
      'Colección permanente de pintura paraguaya',
      'Salas de escultura clásica y moderna',
      'Talleres culturales de fin de semana',
    ],
    horarios: 'Martes a sábados de 09:00 a 19:00',
    costo_entrada: 20000,
    imagen_url: '/src/assets/images/site_museo_barro_1795639490316.jpg',
  },
  {
    nombre: 'Paseo Fluvial Bahía de Asunción y Mirador',
    tipo: 'Sitio Turístico',
    descripcion:
      'Recorrido guiado en embarcación por la bahía y el río Paraguay con interpretación histórica de la ribera, vista panorámica del casco antiguo y refrigerio típico.',
    direccion: 'Muelle Turístico Costanera José Asunción Flores, Asunción',
    contacto: '+595 981 555 240 · turismobahia.py',
    latitud: -25.2749,
    longitud: -57.6345,
    actividades: [
      'Navegación guiada por la Bahía de Asunción',
      'Fotografía panorámica al atardecer',
      'Degustación cultural a bordo',
    ],
    horarios: 'Jueves a domingo · Salidas a las 16:00 y 17:30',
    costo_entrada: 80000,
    imagen_url: '/src/assets/images/hero_asuncion_patrimonio_1795639489543.jpg',
  },
];

let supabaseClient: SupabaseClient | null = null;
let supabaseChecked = false;
let supabaseSeedAttempted = false;

function getSupabaseClient(): SupabaseClient | null {
  if (supabaseChecked) return supabaseClient;
  supabaseChecked = true;

  const url = process.env.SUPABASE_URL?.trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)?.trim();

  if (url && key && (url.startsWith('https://') || url.startsWith('http://'))) {
    supabaseClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return supabaseClient;
}

export function getStorageMode(): 'supabase' | 'local' {
  return getSupabaseClient() ? 'supabase' : 'local';
}

function readLocalSites(): TouristSite[] {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    const seeded: TouristSite[] = INITIAL_SITES.map((item) => ({
      ...item,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    }));
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(seeded, null, 2), 'utf-8');
    return seeded;
  }
  const raw = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

function writeLocalSites(sites: TouristSite[]): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(sites, null, 2), 'utf-8');
}

function defaultImageForCategory(tipo: SiteCategory): string {
  switch (tipo) {
    case 'Museo':
      return '/src/assets/images/site_museo_barro_1795639490316.jpg';
    case 'Patrimonio Histórico':
      return '/src/assets/images/site_panteon_heroes_1795639490670.jpg';
    case 'Espacio Cultural':
      return '/src/assets/images/site_manzana_rivera_1795639490452.jpg';
    case 'Parque y Naturaleza':
      return '/src/assets/images/site_jardin_botanico_1795639489377.jpg';
    default:
      return '/src/assets/images/hero_asuncion_patrimonio_1795639489543.jpg';
  }
}

function sanitizeImageUrl(url: unknown, tipo: SiteCategory): string {
  if (typeof url !== 'string' || !url.trim()) {
    return defaultImageForCategory(tipo);
  }
  const trimmed = url.trim();
  if (
    trimmed.startsWith('/src/assets/images/') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://')
  ) {
    return trimmed;
  }
  return defaultImageForCategory(tipo);
}

export function validateAndNormalizeSiteInput(raw: unknown): SiteInput {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Datos del sitio turístico inválidos.');
  }
  const body = raw as Record<string, unknown>;

  const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : '';
  if (!nombre || nombre.length > 160) {
    throw new Error('El nombre del lugar es obligatorio (máx. 160 caracteres).');
  }

  const tipo = typeof body.tipo === 'string' ? (body.tipo.trim() as SiteCategory) : 'Sitio Turístico';
  if (!SITE_CATEGORIES.includes(tipo)) {
    throw new Error('El tipo de atractivo seleccionado no es válido.');
  }

  const descripcion = typeof body.descripcion === 'string' ? body.descripcion.trim().slice(0, 2000) : '';

  const direccion = typeof body.direccion === 'string' ? body.direccion.trim() : '';
  if (!direccion || direccion.length > 240) {
    throw new Error('La dirección es obligatoria (máx. 240 caracteres).');
  }

  const contacto = typeof body.contacto === 'string' ? body.contacto.trim().slice(0, 160) : '';

  const latitud = Number(body.latitud);
  const longitud = Number(body.longitud);
  if (!Number.isFinite(latitud) || latitud < -90 || latitud > 90) {
    throw new Error('La latitud debe ser un número válido entre -90 y 90.');
  }
  if (!Number.isFinite(longitud) || longitud < -180 || longitud > 180) {
    throw new Error('La longitud debe ser un número válido entre -180 y 180.');
  }

  let actividades: string[] = [];
  if (Array.isArray(body.actividades)) {
    actividades = body.actividades
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean)
      .slice(0, 20);
  } else if (typeof body.actividades === 'string') {
    actividades = body.actividades
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 20);
  }

  const horarios = typeof body.horarios === 'string' ? body.horarios.trim() : '';
  if (!horarios || horarios.length > 180) {
    throw new Error('El horario de atención es obligatorio (máx. 180 caracteres).');
  }

  const costoRaw = Number(body.costo_entrada);
  if (!Number.isFinite(costoRaw) || costoRaw < 0) {
    throw new Error('El costo de entrada debe ser un monto válido mayor o igual a 0 Gs.');
  }
  const costo_entrada = Math.round(costoRaw);

  const imagen_url = sanitizeImageUrl(body.imagen_url, tipo);

  return {
    nombre,
    tipo,
    descripcion,
    direccion,
    contacto,
    latitud: Number(latitud.toFixed(6)),
    longitud: Number(longitud.toFixed(6)),
    actividades,
    horarios,
    costo_entrada,
    imagen_url,
  };
}

function normalizeDbRow(row: Record<string, unknown>): TouristSite {
  const tipo = SITE_CATEGORIES.includes(row.tipo as SiteCategory)
    ? (row.tipo as SiteCategory)
    : 'Sitio Turístico';
  return {
    id: String(row.id),
    nombre: String(row.nombre ?? ''),
    tipo,
    descripcion: String(row.descripcion ?? ''),
    direccion: String(row.direccion ?? ''),
    contacto: String(row.contacto ?? ''),
    latitud: Number(row.latitud ?? -25.2821),
    longitud: Number(row.longitud ?? -57.6352),
    actividades: Array.isArray(row.actividades)
      ? row.actividades.map((a) => String(a))
      : [],
    horarios: String(row.horarios ?? ''),
    costo_entrada: Number(row.costo_entrada ?? 0),
    imagen_url: sanitizeImageUrl(row.imagen_url, tipo),
    created_at: row.created_at ? String(row.created_at) : undefined,
  };
}

export async function listSites(): Promise<TouristSite[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return readLocalSites();
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Error al consultar Supabase: ${error.message}`);
  }

  if ((!data || data.length === 0) && !supabaseSeedAttempted) {
    supabaseSeedAttempted = true;
    const { data: inserted, error: seedError } = await supabase
      .from(TABLE_NAME)
      .insert(INITIAL_SITES)
      .select('*');
    if (seedError) {
      throw new Error(`Error al inicializar registros en Supabase: ${seedError.message}`);
    }
    return (inserted ?? []).map((r) => normalizeDbRow(r as Record<string, unknown>));
  }

  return (data ?? []).map((r) => normalizeDbRow(r as Record<string, unknown>));
}

export async function getSiteById(id: string): Promise<TouristSite | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    const sites = readLocalSites();
    return sites.find((s) => s.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`Error al consultar el sitio en Supabase: ${error.message}`);
  }
  return data ? normalizeDbRow(data as Record<string, unknown>) : null;
}

export async function createSite(input: SiteInput): Promise<TouristSite> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    const sites = readLocalSites();
    const created: TouristSite = {
      ...input,
      imagen_url: input.imagen_url || defaultImageForCategory(input.tipo),
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    sites.push(created);
    writeLocalSites(sites);
    return created;
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(input)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Error al guardar en Supabase: ${error.message}`);
  }
  return normalizeDbRow(data as Record<string, unknown>);
}

export async function updateSite(id: string, input: SiteInput): Promise<TouristSite | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    const sites = readLocalSites();
    const idx = sites.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    const updated: TouristSite = {
      ...sites[idx],
      ...input,
      imagen_url: input.imagen_url || defaultImageForCategory(input.tipo),
    };
    sites[idx] = updated;
    writeLocalSites(sites);
    return updated;
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(input)
    .eq('id', id)
    .select('*')
    .maybeSingle();

  if (error) {
    throw new Error(`Error al actualizar en Supabase: ${error.message}`);
  }
  return data ? normalizeDbRow(data as Record<string, unknown>) : null;
}

export async function deleteSite(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    const sites = readLocalSites();
    const next = sites.filter((s) => s.id !== id);
    if (next.length === sites.length) return false;
    writeLocalSites(next);
    return true;
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id)
    .select('id');

  if (error) {
    throw new Error(`Error al eliminar en Supabase: ${error.message}`);
  }
  return Array.isArray(data) && data.length > 0;
}
