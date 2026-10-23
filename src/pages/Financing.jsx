import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Breadcrumbs, Select } from '../components/ui';
import { getVehicle, vehicleName, vehicles } from '../data/vehicles';
import { calculateFinancing } from '../lib/financiamiento';
import './Financing.css';
const money = (n) => `US$ ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export default function Financing() {
  const [params, setParams] = useSearchParams();
  const requested = params.get('vehiculo');
  const vehicle = getVehicle(requested) || vehicles[0];
  const [downPercent, setDownPercent] = useState('20');
  const [annualRate, setAnnualRate] = useState('12');
  const [months, setMonths] = useState('36');
  const result = calculateFinancing({ price: vehicle.price, downPercent, annualRate, months });
  return <div className="page financing container">
    <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Simulador de cuotas' }]} />
    <header className="financing__head">
      <p className="eyebrow">Planea tu siguiente paso</p>
      <h1 className="display">Haz tus <span className="text-yellow">números.</span></h1>
      <p className="lead">Explora cómo cambian las cuotas según la inicial, el plazo y la tasa que ingreses.</p>
    </header>
    {requested && !getVehicle(requested) && <p role="status">Ese vehículo no está en el catálogo. Seleccionamos {vehicleName(vehicle)} para que puedas continuar.</p>}
    <div className="financing__layout">
      <form className="financing__form" onSubmit={(e) => e.preventDefault()} aria-label="Datos de la simulación">
        <h2>Configura tu simulación</h2>
        <label htmlFor="finance-vehicle">Vehículo</label>
        <Select id="finance-vehicle" label="Vehículo" value={vehicle.id} onChange={(id) => setParams({ vehiculo: id }, { replace: true })} options={vehicles.map((v) => ({ value: v.id, label: vehicleName(v) }))} />
        <div className="financing__vehicle"><img src={vehicle.image} alt={vehicleName(vehicle)} /><div><strong>{vehicleName(vehicle)}</strong><p>{money(vehicle.price)}</p><small>Precio referencial</small></div></div>
        <label htmlFor="finance-down">Cuota inicial (%)</label>
        <input id="finance-down" className="field-input" type="number" min="0" max="100" step="any" required value={downPercent} onChange={(e) => setDownPercent(e.target.value)} aria-describedby="finance-note" />
        <label htmlFor="finance-months">Plazo</label>
        <Select id="finance-months" label="Plazo" value={months} onChange={setMonths} options={[12, 24, 36, 48, 60, 72].map((n) => ({ value: String(n), label: `${n} meses` }))} />
        <label htmlFor="finance-rate">Tasa efectiva anual — TEA (%)</label>
        <input id="finance-rate" className="field-input" type="number" min="0" max="100" step="any" required value={annualRate} onChange={(e) => setAnnualRate(e.target.value)} aria-describedby="finance-note" />
        <p className="financing__note" id="finance-note">Valores iniciales de ejemplo. Ingresa la tasa de la propuesta que quieras simular. Inicial de 0 a 100% y TEA de 0 a 100%.</p>
      </form>
      <section className="financing__result" aria-label="Resultado de la simulación" aria-live="polite" aria-atomic="true">
        <p className="eyebrow">Tu escenario</p>
        {result ? <>
          <h2>Cuota mensual estimada</h2>
          <p className="financing__payment">{money(result.monthlyPayment)}</p>
          <p className="financing__note">{months} cuotas iguales · Moneda: dólares estadounidenses</p>
          <dl>
            <div><dt>Cuota inicial</dt><dd>{money(result.downPayment)}</dd></div>
            <div><dt>Monto a financiar</dt><dd>{money(result.principal)}</dd></div>
            <div><dt>Intereses estimados</dt><dd>{money(result.interest)}</dd></div>
            <div><dt>Total de cuotas</dt><dd>{money(result.loanTotal)}</dd></div>
            <div className="financing__total"><dt>Total con inicial</dt><dd>{money(result.purchaseTotal)}</dd></div>
          </dl>
          <Link className="btn btn--primary btn--block" to={`/contacto?vehiculo=${vehicle.id}&motivo=info#agenda`}>Consultar con un asesor</Link>
          <Link className="financing__back" to={`/vehiculos/${vehicle.id}`}>Ver ficha del vehículo</Link>
        </> : <p role="status">Completa los campos con valores dentro de los rangos indicados para ver tu estimación.</p>}
        <p className="financing__note financing__disclaimer">Simulación orientativa: no constituye una oferta ni una aprobación de crédito. No incluye seguros, comisiones ni otros gastos. La tasa y las condiciones finales deben confirmarse con la entidad financiera.</p>
      </section>
    </div>
  </div>;
}
