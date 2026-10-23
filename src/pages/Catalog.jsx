import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import VehicleCard from '../components/VehicleCard';
import { Select } from '../components/ui';
import { CloseIcon } from '../components/Icons';
import { FILTER_KEYS, draftFromParams, filterVehicles, priceRangeError } from '../lib/catalogo';
import { BRANDS, BUDGETS, VEHICLE_TYPES, YEARS, vehicles } from '../data/vehicles';
import './Catalog.css';
import { useDialog } from '../hooks/useDialog';
import { useMediaQuery } from '../hooks/useMediaQuery';

const SORTS = [
  { value: 'precio-asc', label: 'Precio: menor a mayor' },
  { value: 'precio-desc', label: 'Precio: mayor a menor' },
  { value: 'anio-desc', label: 'Año: más reciente' },
  { value: 'nombre', label: 'Nombre: A – Z' },
];

export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const [draft, setDraft] = useState(() => draftFromParams(params));
  const [error, setError] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filterRef = useRef(null);
  const mobile = useMediaQuery('(max-width: 960px)');
  const closeFilters = useCallback(() => setFiltersOpen(false), []);
  useDialog(filterRef, mobile && filtersOpen, closeFilters);

  useEffect(() => setDraft(draftFromParams(params)), [params]);

  const sort = params.get('orden') || 'precio-asc';
  const q = params.get('q') || '';
  const budget = BUDGETS.find((b) => b.id === params.get('presupuesto'));

  const results = useMemo(() => filterVehicles(vehicles, params), [params]);

  const update = (mutate) => {
    const next = new URLSearchParams(params);
    mutate(next);
    setParams(next);
  };

  const apply = (e) => {
    e.preventDefault();
    const message = priceRangeError(draft);
    setError(message);
    if (message) return;
    update((next) => FILTER_KEYS.forEach((k) => (draft[k] ? next.set(k, draft[k]) : next.delete(k))));
    setFiltersOpen(false);
  };

  const clear = () => {
    setError('');
    setParams(sort !== 'precio-asc' ? { orden: sort } : {});
    setFiltersOpen(false);
  };

  const set = (key) => (value) => setDraft((d) => ({ ...d, [key]: value }));

  const activeChips = [
    q && { key: 'q', label: `“${q}”` },
    budget && { key: 'presupuesto', label: budget.label },
    ...FILTER_KEYS.filter((key) => params.get(key)).map((key) => ({
      key, label: key === 'tipo' ? VEHICLE_TYPES.find((t) => t.id === params.get(key))?.label || params.get(key)
        : key === 'min' ? `Desde US$ ${params.get(key)}` : key === 'max' ? `Hasta US$ ${params.get(key)}` : params.get(key),
    })),
  ].filter(Boolean);

  return (
    <div className="page catalog container">
      <div className="catalog__head">
        <div>
          <p className="eyebrow">Explora Tuerka</p>
          <h1 className="display catalog__title">
            Encuentra <span className="text-yellow">el tuyo.</span>
          </h1>
          <p className="lead">Elige tu próxima historia sobre ruedas.</p>
        </div>
        <div className="catalog__toolbar">
          <p className="catalog__count" aria-live="polite">
            {results.length} {results.length === 1 ? 'vehículo' : 'vehículos'} de ejemplo
          </p>
          <div className="catalog__sort">
            <span>Ordenar por:</span>
            <Select
              label="Ordenar por"
              value={sort}
              onChange={(v) => update((next) => next.set('orden', v))}
              options={SORTS}
            />
          </div>
          <button type="button" className="btn btn--outline catalog__filters-toggle" aria-expanded={filtersOpen} aria-controls="catalog-filters" onClick={() => setFiltersOpen(true)}>
            Filtros
          </button>
        </div>
      </div>

      {activeChips.length > 0 && (
        <div className="catalog__chips">
          {activeChips.map((c) => (
            <button key={c.key} type="button" className="chip" aria-label={`Quitar filtro: ${c.label}`} onClick={() => update((next) => next.delete(c.key))}>
              {c.label} <CloseIcon size={14} />
            </button>
          ))}
        </div>
      )}

      <div className="catalog__layout">
        <aside ref={filterRef} id="catalog-filters" tabIndex={-1} role={mobile && filtersOpen ? 'dialog' : undefined} aria-modal={mobile && filtersOpen ? true : undefined} inert={mobile && !filtersOpen ? '' : undefined} className={`filters ${filtersOpen ? 'filters--open' : ''}`} aria-label="Filtros">
          <form onSubmit={apply}>
            <div className="filters__mobile-head">
              <strong>Filtros</strong>
              <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Cerrar filtros">
                <CloseIcon size={24} />
              </button>
            </div>

            <fieldset>
              <legend>Marca</legend>
              <Select label="Marca" placeholder="Todas las marcas" value={draft.marca} onChange={set('marca')} options={BRANDS.map((b) => ({ value: b, label: b }))} />
            </fieldset>
            <fieldset>
              <legend>Tipo de vehículo</legend>
              <Select label="Tipo de vehículo" placeholder="Todos los tipos" value={draft.tipo} onChange={set('tipo')} options={VEHICLE_TYPES.map((t) => ({ value: t.id, label: t.label }))} />
            </fieldset>
            <fieldset>
              <legend>Condición</legend>
              <Select label="Condición" placeholder="Todos" value={draft.condicion} onChange={set('condicion')} options={[{ value: 'Nuevo', label: 'Nuevo' }, { value: 'Seminuevo', label: 'Seminuevo' }]} />
            </fieldset>
            <fieldset>
              <legend>Precio</legend>
              <div className="filters__range">
                <input className="field-input" type="number" min="0" step="any" inputMode="numeric" placeholder="Mínimo (US$)" aria-label="Precio mínimo en dólares" value={draft.min} onChange={(e) => set('min')(e.target.value)} />
                <input className="field-input" type="number" min="0" step="any" inputMode="numeric" placeholder="Máximo (US$)" aria-label="Precio máximo en dólares" value={draft.max} onChange={(e) => set('max')(e.target.value)} />
              </div>
            </fieldset>
            <fieldset>
              <legend>Año</legend>
              <Select label="Año" placeholder="Todos" value={draft.anio} onChange={set('anio')} options={YEARS.map((y) => ({ value: String(y), label: String(y) }))} />
            </fieldset>
            <fieldset>
              <legend>Transmisión</legend>
              <Select label="Transmisión" placeholder="Todas" value={draft.transmision} onChange={set('transmision')} options={[{ value: 'Automático', label: 'Automático' }, { value: 'Manual', label: 'Manual' }]} />
            </fieldset>

            {error && <p className="filters__error" role="alert">{error}</p>}
            <button type="submit" className="btn btn--primary btn--block filters__apply">
              Aplicar filtros
            </button>
            <button type="button" className="filters__clear" onClick={clear}>
              Limpiar
            </button>
          </form>
        </aside>
        {filtersOpen && <div data-dialog-backdrop="" className="filters__backdrop" onClick={() => setFiltersOpen(false)} />}

        <section aria-label="Resultados">
          {results.length > 0 ? (
            <div className="catalog__grid">
              {results.map((v) => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </div>
          ) : (
            <div className="catalog__empty">
              <h2 className="display">Sin resultados</h2>
              <p>No hay vehículos que coincidan con estos filtros. Prueba ampliando tu búsqueda.</p>
              <button type="button" className="btn btn--primary" onClick={clear}>
                Ver todos los vehículos
              </button>
            </div>
          )}
          <p className="catalog__legal">Inventario de demostración · Precios referenciales</p>
        </section>
      </div>
    </div>
  );
}
