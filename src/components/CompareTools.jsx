import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { COMPARE_LIMIT, useCompare } from '../context/CompareContext';
import { getVehicle, vehicleName } from '../data/vehicles';
import './CompareTools.css';
export function CompareButton({ vehicle }) {
  const { ids, toggle } = useCompare();
  const selected = ids.includes(vehicle.id);
  return <button type="button" className={`compare-button ${selected ? 'is-active' : ''}`} aria-pressed={selected}
    aria-label={`${selected ? 'Quitar' : 'Comparar'} ${vehicleName(vehicle)}${selected ? ' del comparador' : ''}`}
    disabled={!selected && ids.length >= COMPARE_LIMIT} onClick={() => toggle(vehicle.id)}>
    <span aria-hidden="true">{selected ? '✓' : '+'}</span> {selected ? 'En el comparador' : 'Comparar'}
  </button>;
}
export default function CompareTray() {
  const { ids, replace } = useCompare();
  const { pathname } = useLocation();
  const visible = ids.length > 0 && pathname !== '/comparar';
  useEffect(() => {
    document.body.classList.toggle('has-compare-tray', visible);
    return () => document.body.classList.remove('has-compare-tray');
  }, [visible]);
  if (!visible) return null;
  return <aside className="compare-tray" aria-label="Selección para comparar">
    <div><strong role="status">{ids.length} de {COMPARE_LIMIT} vehículos seleccionados</strong>
      <p>{ids.map((id) => vehicleName(getVehicle(id))).join(' · ')}</p>
    </div>
    <Link className="btn btn--primary" to={`/comparar?ids=${ids.join(',')}`}>Ver comparación</Link>
    <button type="button" className="compare-tray__clear" onClick={() => replace([])}>Vaciar selección</button>
  </aside>;
}
