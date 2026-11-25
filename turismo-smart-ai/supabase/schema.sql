-- Tabla principal para Turismo Smart AI en Supabase
-- Ejecutar este script en el SQL Editor de tu proyecto Supabase

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.sitios_turisticos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL,
  descripcion TEXT NOT NULL DEFAULT '',
  direccion TEXT NOT NULL,
  contacto TEXT NOT NULL DEFAULT '',
  latitud DOUBLE PRECISION NOT NULL,
  longitud DOUBLE PRECISION NOT NULL,
  actividades TEXT[] NOT NULL DEFAULT '{}',
  horarios TEXT NOT NULL,
  costo_entrada INTEGER NOT NULL DEFAULT 0 CHECK (costo_entrada >= 0),
  imagen_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para optimizar búsquedas por categoría y presupuesto
CREATE INDEX IF NOT EXISTS idx_sitios_tipo ON public.sitios_turisticos (tipo);
CREATE INDEX IF NOT EXISTS idx_sitios_costo ON public.sitios_turisticos (costo_entrada);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.sitios_turisticos ENABLE ROW LEVEL SECURITY;

-- Política de lectura pública (el servidor utiliza SUPABASE_SERVICE_ROLE_KEY para operaciones CRUD seguras)
DROP POLICY IF EXISTS "Lectura publica de sitios turisticos" ON public.sitios_turisticos;
CREATE POLICY "Lectura publica de sitios turisticos"
  ON public.sitios_turisticos
  FOR SELECT
  USING (true);

-- Datos iniciales de demostración (Asunción, Paraguay)
INSERT INTO public.sitios_turisticos
  (nombre, tipo, descripcion, direccion, contacto, latitud, longitud, actividades, horarios, costo_entrada, imagen_url)
VALUES
  (
    'Museo del Barro (Centro de Artes Visuales)',
    'Museo',
    'Referente fundamental del arte popular, indígena y contemporáneo del Paraguay, con valiosas colecciones de cerámica, tallas en madera y textiles tradicionales.',
    'Grabadores del Cabichuí 2716, Asunción',
    '+595 21 607 996 · museodelbarro.org',
    -25.2842,
    -57.5624,
    ARRAY['Recorrido por cerámica indígena y popular', 'Galería de arte contemporáneo', 'Visita guiada patrimonial'],
    'Martes a sábado de 14:00 a 20:00',
    50000,
    '/src/assets/images/site_museo_barro_1795639490316.jpg'
  ),
  (
    'Panteón Nacional de los Héroes',
    'Patrimonio Histórico',
    'Monumento arquitectónico neoclásico en el corazón de Asunción donde descansan los restos de los principales próceres y héroes de la historia paraguaya.',
    'Palma y Chile, Centro Histórico, Asunción',
    '+595 21 445 700 · cultura.gov.py',
    -25.2821,
    -57.6352,
    ARRAY['Cambio de guardia de honor', 'Visita arquitectónica neoclásica', 'Recorrido histórico guiado'],
    'Lunes a domingo de 08:00 a 18:00',
    0,
    '/src/assets/images/site_panteon_heroes_1795639490670.jpg'
  ),
  (
    'Centro Cultural Manzana de la Rivera',
    'Espacio Cultural',
    'Complejo arquitectónico compuesto por nueve casas coloniales y republicanas restauradas frente al Palacio de López, sede de museos, bibliotecas y exposiciones.',
    'Ayolas 129 c/ Benjamín Constant, Asunción',
    '+595 21 442 448 · asuncion.gov.py',
    -25.2804,
    -57.6383,
    ARRAY['Exposiciones de arte y fotografía', 'Museo Memoria de la Ciudad', 'Biblioteca y ciclos de cine'],
    'Lunes a viernes de 08:30 a 20:00 · Sábados 09:00 a 17:00',
    0,
    '/src/assets/images/site_manzana_rivera_1795639490452.jpg'
  ),
  (
    'Palacio de López y Explanada Litoral',
    'Sitio Turístico',
    'Sede oficial del Gobierno nacional con arquitectura ecléctica de mediados del siglo XIX, jardines abiertos y vista directa a la Bahía de Asunción.',
    'El Paraguayo Independiente y O''Leary, Asunción',
    '+595 21 414 0000 · presidencia.gov.py',
    -25.2775,
    -57.6378,
    ARRAY['Fotografía de fachada iluminada', 'Paseo por la explanada y Costanera', 'Recorrido histórico exterior'],
    'Explanada abierta todos los días · Visitas internas con reserva',
    0,
    '/src/assets/images/hero_asuncion_patrimonio_1795639489543.jpg'
  ),
  (
    'Museo Casa de la Independencia',
    'Museo',
    'Casona colonial de 1772 donde se gestó la independencia del Paraguay en mayo de 1811. Conserva mobiliario original, documentos y el histórico callejón.',
    '14 de Mayo esq. Presidente Franco, Asunción',
    '+595 21 493 918 · casadelaindependencia.org.py',
    -25.2809,
    -57.6374,
    ARRAY['Sala Capitular y mobiliario de época', 'Visita guiada sobre la gesta de mayo de 1811', 'Archivo documental histórico'],
    'Martes a viernes de 08:00 a 17:00 · Sábados 08:00 a 12:00',
    10000,
    '/src/assets/images/site_manzana_rivera_1795639490452.jpg'
  ),
  (
    'Jardín Botánico y Museo de Historia Natural',
    'Parque y Naturaleza',
    'Extenso pulmón verde de Asunción que alberga senderos de flora nativa, palmares, antiguos caserones históricos y colecciones de ciencias naturales.',
    'Av. Primer Presidente y Artigas, Trinidad, Asunción',
    '+595 21 290 807 · asuncion.gov.py',
    -25.2536,
    -57.5718,
    ARRAY['Senderismo bajo lapachos y palmares', 'Visita al Museo de Historia Natural', 'Avistamiento de flora y fauna nativa'],
    'Martes a domingo de 07:00 a 17:00',
    15000,
    '/src/assets/images/site_jardin_botanico_1795639489377.jpg'
  ),
  (
    'Museo Nacional de Bellas Artes (MNBA)',
    'Museo',
    'Institución emblemática dedicada a la conservación y difusión de pinturas, esculturas y grabados de artistas paraguayos e internacionales.',
    'Eligio Ayala 1345 e/ Pa''i Pérez y Curupayty, Asunción',
    '+595 21 211 664 · cultura.gov.py',
    -25.2869,
    -57.6241,
    ARRAY['Colección permanente de pintura paraguaya', 'Salas de escultura clásica y moderna', 'Talleres culturales de fin de semana'],
    'Martes a sábados de 09:00 a 19:00',
    20000,
    '/src/assets/images/site_museo_barro_1795639490316.jpg'
  ),
  (
    'Paseo Fluvial Bahía de Asunción y Mirador',
    'Sitio Turístico',
    'Recorrido guiado en embarcación por la bahía y el río Paraguay con interpretación histórica de la ribera, vista panorámica del casco antiguo y refrigerio típico.',
    'Muelle Turístico Costanera José Asunción Flores, Asunción',
    '+595 981 555 240 · turismobahia.py',
    -25.2749,
    -57.6345,
    ARRAY['Navegación guiada por la Bahía de Asunción', 'Fotografía panorámica al atardecer', 'Degustación cultural a bordo'],
    'Jueves a domingo · Salidas a las 16:00 y 17:30',
    80000,
    '/src/assets/images/hero_asuncion_patrimonio_1795639489543.jpg'
  );
