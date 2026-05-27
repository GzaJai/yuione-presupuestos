import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Plus, Search, UserRound } from 'lucide-react';

/**
 * Select con buscador para elegir un cliente de la lista.
 * Incluye botón "Nuevo Cliente" al costado.
 *
 * @param {{
 *   clients: { id: number, name: string, cuitDni?: string }[],
 *   selectedClient: object | null,
 *   onSelect: (client: object) => void,
 *   onNewClient: () => void,
 *   error?: string,
 * }} props
 */
export default function ClientSelect({
  clients = [],
  selectedClient,
  onSelect,
  onNewClient,
  error,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // ── Filtrar clientes según búsqueda ──
  const filtered = clients.filter((c) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.cuitDni && c.cuitDni.toLowerCase().includes(q))
    );
  });

  // ── Cerrar al hacer click fuera ──
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // ── Resetear búsqueda al abrir/cerrar ──
  const toggle = useCallback(() => {
    setOpen((prev) => {
      if (prev) setQuery('');
      return !prev;
    });
  }, []);

  // ── Seleccionar cliente ──
  const handleSelect = (client) => {
    onSelect(client);
    setOpen(false);
    setQuery('');
  };

  // ── Manejar teclas en el input ──
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
    if (e.key === 'Enter' && filtered.length > 0) {
      handleSelect(filtered[0]);
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
    }
  };

  return (
    <div className="flex gap-2 items-end">
      {/* ── Select con buscador ── */}
      <div ref={containerRef} className="relative flex-1">
        {/* Trigger */}
        <button
          type="button"
          onClick={toggle}
          className={`
            w-full flex items-center gap-2 rounded-lg border px-3 py-2 text-sm
            transition-all duration-150 cursor-pointer bg-input-bg
            ${error ? 'border-primary ring-1 ring-primary/30' : 'border-input-border'}
            ${selectedClient ? 'text-text-primary' : 'text-text-secondary'}
          `}
        >
          <UserRound size={14} className="text-text-secondary shrink-0" />
          <span className="flex-1 text-left truncate">
            {selectedClient
              ? selectedClient.name
              : 'Seleccionar cliente…'}
          </span>
          <ChevronDown
            size={14}
            className={`text-text-secondary transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {error && (
          <p className="text-xs text-primary mt-1">{error}</p>
        )}

        {/* Dropdown */}
        {open && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-card-border bg-card shadow-xl overflow-hidden animate-fade-in transition-colors duration-200">
            {/* Buscador */}
            <div className="flex items-center gap-2 border-b border-card-border px-3 py-2">
              <Search size={14} className="text-text-secondary shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Buscar cliente…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-secondary"
              />
            </div>

            {/* Lista de clientes */}
            <div className="max-h-48 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-3 py-6 text-center text-xs text-text-secondary">
                  {query.trim()
                    ? 'No se encontraron clientes'
                    : 'Todavía no hay clientes guardados'}
                </div>
              ) : (
                filtered.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => handleSelect(client)}
                    className={`
                      w-full text-left px-3 py-2.5 text-sm transition-colors cursor-pointer
                      border-b border-card-border/50 last:border-b-0
                      ${selectedClient?.id === client.id ? 'bg-history-row text-primary' : 'text-text-primary hover:bg-history-row'}
                    `}
                  >
                    <span className="font-medium">{client.name}</span>
                    {client.cuitDni && (
                      <span className="text-text-secondary ml-2 text-xs">
                        {client.cuitDni}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Opción crear nuevo */}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setQuery('');
                onNewClient();
              }}
              className="w-full flex items-center gap-2 border-t border-card-border px-3 py-2.5 text-sm text-primary hover:bg-history-row transition-colors cursor-pointer"
            >
              <Plus size={14} />
              Crear nuevo cliente
            </button>
          </div>
        )}
      </div>

      {/* ── Botón Nuevo Cliente ── */}
      <button
        type="button"
        onClick={onNewClient}
        className="flex items-center justify-center gap-1.5 rounded-lg border border-input-border bg-input-bg px-3 py-2 text-sm text-text-secondary hover:text-primary hover:border-primary/50 transition-all cursor-pointer whitespace-nowrap"
        title="Nuevo cliente"
      >
        <Plus size={16} />
        <span className="hidden sm:inline">Nuevo</span>
      </button>
    </div>
  );
}
