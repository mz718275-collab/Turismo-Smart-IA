import { Plus } from 'lucide-react';

interface HeaderProps {
  onNewSite: () => void;
}

export function Header({ onNewSite }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-[#FAF9F6]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6 lg:px-8">
        <a
          href="#inicio"
          className="font-editorial text-xl font-semibold tracking-tight text-stone-900 whitespace-nowrap shrink-0"
        >
          Turismo Smart AI
        </a>

        <nav
          aria-label="Navegación principal"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600"
        >
          <a
            href="#catalogo"
            className="hover:text-stone-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Catálogo
          </a>
          <a
            href="#mapa"
            className="hover:text-stone-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Mapa OSM
          </a>
          <a
            href="#asistente"
            className="hover:text-stone-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Asistente IA
          </a>
          <a
            href="#arquitectura"
            className="hover:text-stone-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Despliegue
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onNewSite}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1E3A8A] px-4 py-2 text-sm font-medium text-white hover:bg-[#172D6E] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Nuevo Sitio</span>
          </button>
        </div>
      </div>
    </header>
  );
}
