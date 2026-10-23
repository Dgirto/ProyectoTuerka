export function validVehicleIds(value, allowedIds, limit = Infinity) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((id) => typeof id === 'string' && allowedIds.includes(id)))].slice(0, limit);
}
export function readVehicleIds(storage, key, allowedIds, limit) {
  try { return validVehicleIds(JSON.parse(storage.getItem(key) || '[]'), allowedIds, limit); }
  catch { return []; }
}
