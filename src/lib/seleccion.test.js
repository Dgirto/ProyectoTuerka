import { expect, it } from 'vitest';
import { validVehicleIds, readVehicleIds } from './seleccion';
const allowed = ['a', 'b', 'c', 'd'];
it('descarta ids desconocidos, duplicados y valores inválidos al compartir una comparación', () => {
  expect(validVehicleIds(['a', 'a', null, 'desconocido', 'b', 'c', 'd'], allowed, 3)).toEqual(['a', 'b', 'c']);
  expect(validVehicleIds({ a: true }, allowed)).toEqual([]);
});
it('recupera una selección válida y tolera almacenamiento corrupto o bloqueado', () => {
  expect(readVehicleIds({ getItem: () => '["a","b"]' }, 'key', allowed, 3)).toEqual(['a', 'b']);
  expect(readVehicleIds({ getItem: () => '{broken' }, 'key', allowed)).toEqual([]);
  expect(readVehicleIds({ getItem: () => { throw new Error('blocked'); } }, 'key', allowed)).toEqual([]);
});
