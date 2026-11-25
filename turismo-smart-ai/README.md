# Turismo Smart AI

Sistema web dinámico dedicado a sitios turísticos, museos y espacios culturales del Paraguay, con catálogo CRUD completo, mapa interactivo basado en **OpenStreetMap** con exportación directa a **Google Maps**, base de datos **Supabase** y asistente inteligente impulsado por **Google Gemini**.

## Arquitectura e Integraciones

1. **Base de datos (Supabase)**:
   - Ejecuta el archivo `supabase/schema.sql` en el **SQL Editor** de tu proyecto en Supabase para crear la tabla `sitios_turisticos` y cargar los 8 lugares iniciales.
   - Si todavía no se configuran `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`, el servidor utiliza automáticamente almacenamiento local persistente (`data/sitios_turisticos.json`) para que todas las altas, bajas y modificaciones funcionen sin interrupciones.

2. **Mapa Interactivo (OpenStreetMap + Google Maps)**:
   - Visualización cartográfica interactiva con **Leaflet + OpenStreetMap**.
   - Selección de marcadores con ficha informativa completa y selector de coordenadas al registrar o editar sitios.
   - Exportación directa a **Google Maps**: ver ubicación exacta, trazar cómo llegar, abrir un circuito multi-parada en Google Maps o descargar archivo `.kml` compatible con **Google My Maps**.

3. **Asistente Inteligente (Gemini API)**:
   - Endpoint seguro en servidor (`POST /api/chat`) que consulta los registros reales y vigentes de la base de datos en cada pregunta.

4. **Variables de entorno (Render / `.env`)**:
   Configura las siguientes variables en el panel de Render (`Environment`) o en tu archivo `.env` local (nunca subas claves reales a GitHub):
   - `GEMINI_API_KEY`: Tu clave de Google AI Studio.
   - `SUPABASE_URL`: URL de tu proyecto Supabase.
   - `SUPABASE_SERVICE_ROLE_KEY`: Clave privada `service_role` de Supabase (recomendada para el servidor).
   - `SUPABASE_ANON_KEY`: Clave pública `anon` (respaldo si las políticas RLS permiten escritura).

5. **Publicación en Render desde GitHub**:
   - Sube este repositorio a GitHub (`git push origin main`).
   - En Render, selecciona **New + > Blueprint** (detecta automáticamente `render.yaml`) o **Web Service**.
   - Comando de compilación (`Build Command`): `npm install && npm run build`
   - Comando de inicio (`Start Command`): `npm start`
