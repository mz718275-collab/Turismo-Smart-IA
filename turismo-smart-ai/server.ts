import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import {
  createSite,
  deleteSite,
  getSiteById,
  getStorageMode,
  listSites,
  updateSite,
  validateAndNormalizeSiteInput,
} from './server/db.ts';
import { formatGuaranies } from './src/types.ts';

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Estado del sistema (sin exponer claves ni secretos)
  app.get('/api/health', async (_req: Request, res: Response) => {
    try {
      const sites = await listSites();
      res.json({
        storageMode: getStorageMode(),
        geminiConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()),
        totalSites: sites.length,
      });
    } catch (error) {
      res.status(500).json({
        storageMode: getStorageMode(),
        geminiConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()),
        error: error instanceof Error ? error.message : 'Error al consultar la base de datos.',
      });
    }
  });

  // Consulta y filtrado de sitios turísticos
  app.get('/api/sites', async (req: Request, res: Response) => {
    try {
      let sites = await listSites();
      const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
      const tipo = typeof req.query.tipo === 'string' ? req.query.tipo.trim() : '';
      const maxCostoRaw = typeof req.query.maxCosto === 'string' ? req.query.maxCosto.trim() : '';

      if (q) {
        sites = sites.filter(
          (s) =>
            s.nombre.toLowerCase().includes(q) ||
            s.descripcion.toLowerCase().includes(q) ||
            s.direccion.toLowerCase().includes(q) ||
            s.actividades.some((a) => a.toLowerCase().includes(q))
        );
      }

      if (tipo && tipo !== 'Todos') {
        sites = sites.filter((s) => s.tipo === tipo);
      }

      if (maxCostoRaw !== '') {
        const maxCosto = Number(maxCostoRaw);
        if (Number.isFinite(maxCosto) && maxCosto >= 0) {
          sites = sites.filter((s) => s.costo_entrada <= maxCosto);
        }
      }

      res.json({ sites, storageMode: getStorageMode() });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'No se pudieron obtener los registros.',
      });
    }
  });

  // Consulta individual
  app.get('/api/sites/:id', async (req: Request, res: Response) => {
    try {
      const site = await getSiteById(req.params.id);
      if (!site) {
        res.status(404).json({ error: 'Sitio no encontrado.' });
        return;
      }
      res.json({ site });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Error al consultar el sitio.',
      });
    }
  });

  // Alta (Crear)
  app.post('/api/sites', async (req: Request, res: Response) => {
    try {
      const normalized = validateAndNormalizeSiteInput(req.body);
      const created = await createSite(normalized);
      res.status(201).json({ site: created });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo registrar el sitio.';
      const status = message.includes('Supabase') ? 500 : 400;
      res.status(status).json({ error: message });
    }
  });

  // Modificación (Actualizar)
  app.put('/api/sites/:id', async (req: Request, res: Response) => {
    try {
      const normalized = validateAndNormalizeSiteInput(req.body);
      const updated = await updateSite(req.params.id, normalized);
      if (!updated) {
        res.status(404).json({ error: 'Sitio no encontrado para actualizar.' });
        return;
      }
      res.json({ site: updated });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo actualizar el sitio.';
      const status = message.includes('Supabase') ? 500 : 400;
      res.status(status).json({ error: message });
    }
  });

  // Baja (Eliminar)
  app.delete('/api/sites/:id', async (req: Request, res: Response) => {
    try {
      const deleted = await deleteSite(req.params.id);
      if (!deleted) {
        res.status(404).json({ error: 'Sitio no encontrado para eliminar.' });
        return;
      }
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'No se pudo eliminar el sitio.',
      });
    }
  });

  // Asistente Inteligente con Gemini API y acceso en tiempo real al catálogo
  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
      if (!message || message.length > 1500) {
        res.status(400).json({ error: 'Ingresa una consulta válida (máximo 1500 caracteres).' });
        return;
      }

      const ai = getGeminiClient();
      if (!ai) {
        res.status(503).json({
          error:
            'La clave GEMINI_API_KEY no está configurada en el servidor. Agrégala en Settings > Secrets o en las variables de entorno de Render.',
        });
        return;
      }

      const liveSites = await listSites();
      const catalogContext = liveSites.map((s) => ({
        nombre: s.nombre,
        tipo: s.tipo,
        costo_entrada_gs: s.costo_entrada,
        costo_legible: formatGuaranies(s.costo_entrada),
        horarios: s.horarios,
        direccion: s.direccion,
        contacto: s.contacto,
        actividades: s.actividades,
        coordenadas: { latitud: s.latitud, longitud: s.longitud },
        descripcion: s.descripcion,
      }));

      const rawHistory = Array.isArray(req.body?.history) ? req.body.history : [];
      const historyLines = rawHistory
        .slice(-6)
        .filter(
          (item: unknown): item is { role: 'user' | 'model'; text: string } =>
            Boolean(
              item &&
                typeof item === 'object' &&
                ((item as { role?: string }).role === 'user' ||
                  (item as { role?: string }).role === 'model') &&
                typeof (item as { text?: unknown }).text === 'string'
            )
        )
        .map((item: { role: 'user' | 'model'; text: string }) =>
          `${item.role === 'user' ? 'Usuario' : 'Asistente'}: ${item.text.slice(0, 600)}`
        )
        .join('\n');

      const systemInstruction = `Eres el asistente inteligente oficial de "Turismo Smart AI", una guía cultural y turística conectada en tiempo real a la base de datos del sistema (${getStorageMode() === 'supabase' ? 'Supabase' : 'catálogo del sistema'}).

REGLAS OBLIGATORIAS:
1. Responde siempre en español claro, cordial, organizado y práctico.
2. Usa EXCLUSIVAMENTE los registros reales proporcionados abajo en "CATÁLOGO REGISTRADO ACTUAL". No inventes museos, precios, direcciones ni horarios que no estén en el listado.
3. Cuando el usuario pregunte por un presupuesto en Guaraníes (por ejemplo 50.000 Gs.):
   - Lista todos los lugares cuya entrada individual es menor o igual a ese monto (indicando explícitamente cuáles son gratuitos y el costo exacto en Gs. de cada uno).
   - También muestra un ejemplo práctico de combinación de varios lugares cuya suma total no supere el presupuesto indicado.
4. Cuando sugieras un itinerario, ordena las paradas de forma lógica por cercanía geográfica usando sus direcciones/coordenadas, horarios de apertura, actividades recomendadas y el costo total acumulado en Gs.
5. Menciona si el usuario puede ubicarlos en el mapa OpenStreetMap del sistema o abrirlos directamente en Google Maps.

CATÁLOGO REGISTRADO ACTUAL (${liveSites.length} lugares):
${JSON.stringify(catalogContext, null, 2)}`;

      const prompt = historyLines
        ? `Historial reciente:\n${historyLines}\n\nNueva consulta del usuario:\n${message}`
        : message;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction,
        },
      });

      const reply = response.text?.trim();
      if (!reply) {
        res.status(502).json({ error: 'El modelo no devolvió una respuesta válida. Intenta nuevamente.' });
        return;
      }

      res.json({
        reply,
        sourcesCount: liveSites.length,
        storageMode: getStorageMode(),
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al procesar la consulta con Gemini.';
      res.status(500).json({ error: msg });
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.resolve(distDir, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Turismo Smart AI escuchando en http://0.0.0.0:${PORT} (${getStorageMode()})`);
  });
}

startServer().catch((err) => {
  console.error('Error al iniciar el servidor:', err);
  process.exit(1);
});
