import { useCallback, useEffect, useMemo, useState } from 'react';
import { AiAssistantSection } from './components/AiAssistantSection';
import { CatalogSection } from './components/CatalogSection';
import { DeploymentSection } from './components/DeploymentSection';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { OpenStreetMapSection } from './components/OpenStreetMapSection';
import { SiteFormModal } from './components/SiteFormModal';
import type { SiteCategory, SiteInput, TouristSite } from './types';

export default function App() {
  const [sites, setSites] = useState<TouristSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storageMode, setStorageMode] = useState<'supabase' | 'local'>('local');
  const [geminiConfigured, setGeminiConfigured] = useState(true);

  // Filtros de búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'Todos' | SiteCategory>('Todos');
  const [maxBudget, setMaxBudget] = useState('');

  // Estado de mapa y ruta Google Maps
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [routeSiteIds, setRouteSiteIds] = useState<string[]>([]);

  // Modal Alta / Modificación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<TouristSite | null>(null);

  const fetchSites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sitesRes, healthRes] = await Promise.all([
        fetch('/api/sites'),
        fetch('/api/health'),
      ]);

      const sitesData = await sitesRes.json();
      if (!sitesRes.ok) {
        throw new Error(sitesData.error || 'No se pudo cargar el catálogo de sitios.');
      }

      setSites(sitesData.sites ?? []);
      if (sitesData.storageMode) {
        setStorageMode(sitesData.storageMode);
      }

      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setStorageMode(healthData.storageMode ?? 'local');
        setGeminiConfigured(Boolean(healthData.geminiConfigured));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSites();
  }, [fetchSites]);

  // Filtrado en tiempo real por texto, tipo de atractivo y presupuesto en Gs.
  const filteredSites = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const budgetNum = maxBudget.trim() !== '' ? Number(maxBudget) : null;

    return sites.filter((site) => {
      if (selectedCategory !== 'Todos' && site.tipo !== selectedCategory) {
        return false;
      }

      if (budgetNum !== null && Number.isFinite(budgetNum) && budgetNum >= 0) {
        if (site.costo_entrada > budgetNum) {
          return false;
        }
      }

      if (q) {
        const matchesText =
          site.nombre.toLowerCase().includes(q) ||
          site.descripcion.toLowerCase().includes(q) ||
          site.direccion.toLowerCase().includes(q) ||
          site.tipo.toLowerCase().includes(q) ||
          site.actividades.some((a) => a.toLowerCase().includes(q));
        if (!matchesText) return false;
      }

      return true;
    });
  }, [sites, searchQuery, selectedCategory, maxBudget]);

  const handleOpenNewModal = () => {
    setEditingSite(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (site: TouristSite) => {
    setEditingSite(site);
    setIsModalOpen(true);
  };

  const handleSaveSite = async (payload: SiteInput, editingId?: string) => {
    const isEdit = Boolean(editingId);
    const url = isEdit ? `/api/sites/${editingId}` : '/api/sites';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'No se pudo guardar el sitio turístico.');
    }

    const savedSite: TouristSite = data.site;
    setSites((prev) =>
      isEdit ? prev.map((s) => (s.id === savedSite.id ? savedSite : s)) : [...prev, savedSite]
    );
    setSelectedSiteId(savedSite.id);
  };

  const handleDeleteSite = async (id: string) => {
    const res = await fetch(`/api/sites/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'No se pudo eliminar el registro.');
      return;
    }

    setSites((prev) => prev.filter((s) => s.id !== id));
    setRouteSiteIds((prev) => prev.filter((rid) => rid !== id));
    if (selectedSiteId === id) {
      setSelectedSiteId(null);
    }
  };

  const handleSelectOnMap = useCallback((site: TouristSite) => {
    setSelectedSiteId(site.id);
    const mapSection = document.getElementById('mapa');
    if (mapSection) {
      mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleToggleRouteSite = useCallback((id: string) => {
    setRouteSiteIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('Todos');
    setMaxBudget('');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900">
      <Header onNewSite={handleOpenNewModal} />

      <main>
        <HeroSection sites={sites} storageMode={storageMode} />

        <CatalogSection
          sites={filteredSites}
          loading={loading}
          error={error}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          maxBudget={maxBudget}
          onMaxBudgetChange={setMaxBudget}
          selectedSiteId={selectedSiteId}
          onSelectOnMap={handleSelectOnMap}
          routeSiteIds={routeSiteIds}
          onToggleRouteSite={handleToggleRouteSite}
          onEditSite={handleOpenEditModal}
          onDeleteSite={handleDeleteSite}
          onResetFilters={handleResetFilters}
        />

        <OpenStreetMapSection
          sites={filteredSites}
          selectedSiteId={selectedSiteId}
          onSelectSite={(site) => setSelectedSiteId(site.id)}
          routeSiteIds={routeSiteIds}
          onToggleRouteSite={handleToggleRouteSite}
          onClearRoute={() => setRouteSiteIds([])}
        />

        <AiAssistantSection totalSites={sites.length} storageMode={storageMode} />

        <DeploymentSection
          storageMode={storageMode}
          geminiConfigured={geminiConfigured}
        />
      </main>

      <SiteFormModal
        isOpen={isModalOpen}
        editingSite={editingSite}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveSite}
      />
    </div>
  );
}
