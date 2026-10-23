import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Breadcrumbs } from '../components/ui';
import VehicleCard from '../components/VehicleCard';
import ReservaBox from '../components/ReservaBox';
import { CalendarIcon, CheckIcon, ChevronLeft, ChevronRight, FuelIcon, GaugeIcon, GearsIcon, HeartIcon } from '../components/Icons';
import { useFavorites } from '../context/FavoritesContext';
import { formatPrice, getVehicle, typeLabel, vehicleName, vehicles } from '../data/vehicles';
import { CompareButton } from '../components/CompareTools';
import NotFound from './NotFound';
import './VehicleDetail.css';

const TABS = ['Descripción', 'Equipamiento', 'Documentación'];

export default function VehicleDetail() {
  const { id } = useParams();
  const vehicle = getVehicle(id);
  if (!vehicle) return <NotFound />;
  // La key reinicia galería y pestañas al cambiar de vehículo.
  return <Detail key={vehicle.id} vehicle={vehicle} />;
}

function Detail({ vehicle }) {
  const [active, setActive] = useState(0);
  const [tab, setTab] = useState(0);
  const { isFavorite, toggle } = useFavorites();
  const name = vehicleName(vehicle);
  const fav = isFavorite(vehicle.id);
  const gallery = vehicle.gallery;
  const related = vehicles.filter((v) => v.id !== vehicle.id && (v.type === vehicle.type || Math.abs(v.price - vehicle.price) < 8000)).slice(0, 3);

  const go = (delta) => setActive((i) => (i + delta + gallery.length) % gallery.length);

  return (
    <div className="page detail container">
      <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Vehículos', to: '/vehiculos' }, { label: name }]} />

      <div className="detail__top">
        <div className="gallery">
          <div className="gallery__main">
            <img src={gallery[active]} alt={`${name}, imagen ${active + 1} de ${gallery.length}`} />
            {gallery.length > 1 && (
              <>
                <button type="button" className="gallery__nav gallery__nav--prev" onClick={() => go(-1)} aria-label="Imagen anterior">
                  <ChevronLeft size={26} />
                </button>
                <button type="button" className="gallery__nav gallery__nav--next" onClick={() => go(1)} aria-label="Imagen siguiente">
                  <ChevronRight size={26} />
                </button>
              </>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="gallery__thumbs">
              {gallery.map((src, i) => (
                <button
                  type="button"
                  key={src}
                  className={`gallery__thumb ${i === active ? 'is-active' : ''}`}
                  onClick={() => setActive(i)}
                  aria-label={`Ver imagen ${i + 1}`}
                  aria-pressed={i === active}
                >
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <aside className="detail__info">
          <span className="detail__badge">{vehicle.condition}</span>
          <h1 className="display detail__name">{name}</h1>
          <p className="detail__sub">
            {vehicle.year} · {typeLabel(vehicle.type)}
          </p>
          <hr />
          <p className="detail__price">US$ {formatPrice(vehicle.price)}</p>
          <p className="detail__price-note">Precio referencial</p>

          <Link to={`/contacto?vehiculo=${vehicle.id}#agenda`} className="btn btn--primary btn--block detail__cta">
            Agendar visita <ChevronRight size={20} />
          </Link>
          <Link to={`/contacto?vehiculo=${vehicle.id}&motivo=info#agenda`} className="btn btn--outline btn--block detail__cta detail__cta--ghost">
            Solicitar información <ChevronRight size={20} />
          </Link>
          <Link to={`/simulador?vehiculo=${vehicle.id}`} className="detail__finance">Simular cuotas →</Link>
          <CompareButton vehicle={vehicle} />
          <ReservaBox vehicle={vehicle} />
          <button type="button" className={`detail__fav ${fav ? 'is-active' : ''}`} onClick={() => toggle(vehicle.id)} aria-pressed={fav}>
            <HeartIcon size={24} filled={fav} />
            {fav ? 'Guardado en favoritos' : 'Guardar en favoritos'}
          </button>

          <dl className="detail__specs">
            <div>
              <CalendarIcon size={30} />
              <div>
                <dt>Año</dt>
                <dd>{vehicle.year}</dd>
              </div>
            </div>
            <div>
              <GaugeIcon size={30} />
              <dt className="sr-only">Kilometraje</dt>
              <dd>{vehicle.km ? `${formatPrice(vehicle.km)} km` : '0 km'}</dd>
            </div>
            <div>
              <GearsIcon size={30} />
              <dt className="sr-only">Transmisión</dt>
              <dd>{vehicle.transmission}</dd>
            </div>
            <div>
              <FuelIcon size={30} />
              <dt className="sr-only">Combustible</dt>
              <dd>{vehicle.fuel}</dd>
            </div>
          </dl>
        </aside>
      </div>

      <section className="tabs">
        <div className="tabs__list" role="tablist" aria-label="Información del vehículo">
          {TABS.map((t, i) => (
            <button
              key={t}
              type="button"
              role="tab"
              id={`tab-${i}`}
              tabIndex={tab === i ? 0 : -1}
              onKeyDown={(e) => {
                const keys = { ArrowRight: (i + 1) % TABS.length, ArrowLeft: (i + TABS.length - 1) % TABS.length, Home: 0, End: TABS.length - 1 };
                if (!(e.key in keys)) return;
                e.preventDefault();
                setTab(keys[e.key]);
                e.currentTarget.parentElement.querySelectorAll('[role="tab"]')[keys[e.key]].focus();
              }}
              aria-selected={tab === i}
              aria-controls={`panel-${i}`}
              className={tab === i ? 'is-active' : ''}
              onClick={() => setTab(i)}
            >
              {t}
            </button>
          ))}
        </div>

        {TABS.map((_, i) => <div key={i} className="tabs__panel" role="tabpanel" hidden={tab !== i} id={`panel-${i}`} aria-labelledby={`tab-${i}`} tabIndex={0}>
          {i === 0 && (
            <div className="tabs__cols">
              {vehicle.description.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          )}
          {i === 1 && (
            <ul className="tabs__list-check">
              {vehicle.equipment.map((e) => (
                <li key={e}>
                  <CheckIcon size={20} /> {e}
                </li>
              ))}
            </ul>
          )}
          {i === 2 && (
            <ul className="tabs__list-check">
              {['Tarjeta de propiedad al día', 'Revisión técnica vigente', 'SOAT vigente', vehicle.condition === 'Nuevo' ? 'Garantía de fábrica' : 'Historial de mantenimiento en concesionario', 'Sin deudas ni gravámenes'].map((d) => (
                <li key={d}>
                  <CheckIcon size={20} /> {d}
                </li>
              ))}
            </ul>
          )}
        </div>)}
      </section>

      {related.length > 0 && (
        <section className="detail__related">
          <h2 className="display">
            También te <span className="text-yellow">puede gustar.</span>
          </h2>
          <div className="detail__related-grid">
            {related.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
