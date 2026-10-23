import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Breadcrumbs } from '../components/ui';
import { useCompare, COMPARE_LIMIT } from '../context/CompareContext';
import { validVehicleIds } from '../lib/seleccion';
import { formatPrice, getVehicle, typeLabel, vehicleName, vehicles } from '../data/vehicles';
import './Compare.css';
const ROWS = [
  ['Precio referencial', (v) => `US$ ${formatPrice(v.price)}`],
  ['Año', (v) => v.year], ['Condición', (v) => v.condition],
  ['Tipo', (v) => typeLabel(v.type)], ['Kilometraje', (v) => `${formatPrice(v.km)} km`],
  ['Transmisión', (v) => v.transmission], ['Combustible', (v) => v.fuel],
];
export default function Compare() {
  const [params, setParams] = useSearchParams();
  const { ids: selected, replace } = useCompare();
  const raw = params.get('ids');
  const ids = raw === null ? selected : validVehicleIds(raw.split(','), vehicles.map((v) => v.id), COMPARE_LIMIT);
  const key = ids.join(',');
  useEffect(() => { if (raw !== null) replace(key ? key.split(',') : []); }, [raw, key, replace]);
  const chosen = ids.map(getVehicle);
  const remove = (id) => {
    const next = ids.filter((v) => v !== id);
    replace(next);
    setParams({ ids: next.join(',') });
  };
  return <div className="page comparison container">
    <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Comparador' }]} />
    <div className="comparison__head">
      <p className="eyebrow">Cada detalle cuenta</p>
      <h1 className="display">Compara tu <span className="text-yellow">próximo camino.</span></h1>
      <p className="lead">Elige hasta tres vehículos y revisa sus diferencias en un solo lugar.</p>
      <Link className="btn btn--outline" to="/vehiculos">{chosen.length ? 'Añadir otro vehículo' : 'Elegir vehículos'}</Link>
    </div>
    {chosen.length ? <>
      {chosen.length === 1 && <p className="comparison__hint" role="status">Añade al menos otro vehículo desde el catálogo para comparar.</p>}
      <p className="comparison__hint">Puedes compartir esta página copiando su enlace. En móvil, desliza la tabla para ver todas las columnas.</p>
      <div className="comparison__scroll" role="region" aria-label="Tabla comparativa de vehículos" tabIndex={0}>
        <table>
          <caption className="sr-only">Comparación de {chosen.map(vehicleName).join(', ')}</caption>
          <thead><tr><th scope="col">Tu selección</th>{chosen.map((v) => <th scope="col" key={v.id}>
            <img src={v.image} alt={vehicleName(v)} />
            <Link className="comparison__name" to={`/vehiculos/${v.id}`}>{vehicleName(v)}</Link>
            <button type="button" onClick={() => remove(v.id)} aria-label={`Quitar ${vehicleName(v)} del comparador`}>Quitar</button>
          </th>)}</tr></thead>
          <tbody>{ROWS.map(([label, value]) => <tr key={label}><th scope="row">{label}</th>{chosen.map((v) => <td key={v.id}>{value(v)}</td>)}</tr>)}
            <tr><th scope="row">Equipamiento</th>{chosen.map((v) => <td key={v.id}><ul>{v.equipment.map((e) => <li key={e}>{e}</li>)}</ul></td>)}</tr>
            <tr><th scope="row">Siguiente paso</th>{chosen.map((v) => <td key={v.id}><Link className="btn btn--primary" to={`/vehiculos/${v.id}`}>Ver vehículo</Link></td>)}</tr>
          </tbody>
        </table>
      </div>
      <p className="comparison__hint">Inventario de demostración · Precios referenciales.</p>
    </> : <div className="comparison__empty"><h2 className="display">Empieza por tus favoritos.</h2><p>Usa el botón «Comparar» del catálogo o de la ficha de cada vehículo.</p></div>}
  </div>;
}
