import { describe, expect, it } from 'vitest';
import { filterVehicles, matchesQuery, priceRangeError } from './catalogo';
const car = { brand: 'Toyota', model: 'Corolla', type: 'sedan', transmission: 'Automático', fuel: 'Diésel', year: 2024, price: 20000 };
const filter = (items, query) => filterVehicles(items, new URLSearchParams(query));
describe('búsqueda y filtros del catálogo', () => {
  it('busca varias palabras sin depender de tildes ni espacios', () => {
    expect(matchesQuery(car, '  TOYOTA automatico diesel sedan  ')).toBe(true);
    expect(matchesQuery(car, 'Toyota manual')).toBe(false);
  });
  it('no pierde los vehículos de exactamente 20 000 o 30 000 dólares', () => {
    const items = [car, { ...car, price: 30000 }, { ...car, price: 30001 }];
    expect(filter(items, 'presupuesto=hasta-20').map((v) => v.price)).toEqual([20000]);
    expect(filter(items, 'presupuesto=20-30').map((v) => v.price)).toEqual([30000]);
    expect(filter(items, 'presupuesto=30-mas').map((v) => v.price)).toEqual([30001]);
  });
  it('respeta un máximo de cero y rechaza rangos inválidos', () => {
    expect(filter([car], 'max=0')).toEqual([]);
    expect(filter([car], 'min=30000&max=20000')).toEqual([]);
    for (const range of [{ min: '-1', max: '' }, { min: 'NaN', max: '' }, { min: '5', max: '1' }]) expect(priceRangeError(range)).not.toBe('');
  });
  it('combina criterios y ordena sin modificar el inventario original', () => {
    const items = [car, { ...car, price: 25000 }, { ...car, brand: 'Kia' }];
    expect(filter(items, 'marca=Toyota&tipo=sedan&orden=precio-desc').map((v) => v.price)).toEqual([25000, 20000]);
    expect(items[0].price).toBe(20000);
  });
});
