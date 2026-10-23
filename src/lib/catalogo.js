import { BUDGETS, typeLabel } from '../data/vehicles';

export const FILTER_KEYS = ['marca', 'tipo', 'condicion', 'min', 'max', 'anio', 'transmision'];
export const draftFromParams = (params) => Object.fromEntries(FILTER_KEYS.map((k) => [k, params.get(k) ?? '']));
const normalize = (text) => String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function matchesQuery(vehicle, query) {
  const text = normalize(`${vehicle.brand} ${vehicle.model} ${typeLabel(vehicle.type)} ${vehicle.year} ${vehicle.transmission} ${vehicle.fuel}`);
  return normalize(query).trim().split(/\s+/).filter(Boolean).every((word) => text.includes(word));
}

export function priceRangeError({ min, max }) {
  const values = [min, max].filter((n) => n !== '');
  if (values.some((n) => !Number.isFinite(Number(n)) || Number(n) < 0)) return 'Ingresa precios válidos, mayores o iguales a cero.';
  if (min !== '' && max !== '' && Number(min) > Number(max)) return 'El precio mínimo no puede superar al máximo.';
  return '';
}

export function filterVehicles(items, params) {
  const f = draftFromParams(params);
  if (priceRangeError(f)) return [];
  const min = f.min === '' ? 0 : Number(f.min);
  const max = f.max === '' ? Infinity : Number(f.max);
  const budget = BUDGETS.find((b) => b.id === params.get('presupuesto'));
  const list = items.filter((v) =>
    (!f.marca || v.brand === f.marca) && (!f.tipo || v.type === f.tipo) &&
    (!f.condicion || v.condition === f.condicion) && (!f.anio || v.year === Number(f.anio)) &&
    (!f.transmision || v.transmission === f.transmision) && v.price >= min && v.price <= max &&
    (!budget || ((budget.minExclusive ? v.price > budget.min : v.price >= budget.min) && v.price <= budget.max)) &&
    matchesQuery(v, params.get('q') || '')
  );
  const sorters = {
    'precio-asc': (a, b) => a.price - b.price,
    'precio-desc': (a, b) => b.price - a.price,
    'anio-desc': (a, b) => b.year - a.year,
    nombre: (a, b) => `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`, 'es'),
  };
  return list.sort(sorters[params.get('orden')] ?? sorters['precio-asc']);
}
