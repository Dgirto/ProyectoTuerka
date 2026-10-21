import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/ui';
import { FavoriteButton } from '../components/VehicleCard';
import { ArrowRight, CompassIcon, HeartIcon, TrashIcon } from '../components/Icons';
import { useFavorites } from '../context/FavoritesContext';
import { formatPrice, getVehicle, typeLabel, vehicleName } from '../data/vehicles';
import './Favorites.css';

export default function Favorites() {
  const { ids, remove } = useFavorites();
  const saved = ids.map(getVehicle).filter(Boolean);

  return (
    <div className="page favs container">
      <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Favoritos' }]} />

      <div className="favs__head">
        <div>
          <h1 className="display favs__title">
            Tus próximos <span className="text-yellow">caminos.</span>
          </h1>
          <p className="lead">Guarda tus opciones y decide a tu ritmo.</p>
        </div>
        <p className="favs__count" aria-live="polite">
          <strong>{saved.length}</strong> {saved.length === 1 ? 'vehículo guardado' : 'vehículos guardados'}
        </p>
      </div>

      {saved.length > 0 ? (
        <div className="favs__grid">
          {saved.map((v) => {
            const name = vehicleName(v);
            return (
              <article className="fcard" key={v.id}>
                <Link to={`/vehiculos/${v.id}`} className="fcard__media" tabIndex={-1} aria-hidden="true">
                  <img src={v.image} alt="" />
                </Link>
                <FavoriteButton id={v.id} name={name} className="fcard__fav" />
                <div className="fcard__body">
                  <div className="fcard__info">
                    <div>
                      <span className="fcard__tag">{typeLabel(v.type)}</span>
                      <h2 className="fcard__name">{name}</h2>
                      <p className="fcard__meta">
                        {v.year} · {v.transmission}
                      </p>
                    </div>
                    <p className="fcard__price">
                      <small>US$</small>
                      {formatPrice(v.price)}
                    </p>
                  </div>
                  <Link to={`/vehiculos/${v.id}`} className="btn btn--primary btn--block fcard__cta">
                    Ver vehículo <ArrowRight size={20} />
                  </Link>
                  <button type="button" className="fcard__remove" onClick={() => remove(v.id)}>
                    <TrashIcon size={20} /> Quitar de favoritos
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="favs__empty">
          <HeartIcon size={48} />
          <h2 className="display">Aún no guardas vehículos</h2>
          <p>Toca el corazón en cualquier vehículo del catálogo para guardarlo aquí.</p>
        </div>
      )}

      <div className="favs__explore">
        <CompassIcon size={60} strokeWidth={1.2} className="favs__compass" />
        <div>
          <h2>¿Todavía estás explorando?</h2>
          <p>Encuentra más opciones para tu siguiente viaje.</p>
        </div>
        <Link to="/vehiculos" className="btn btn--outline-yellow">
          Volver al catálogo <ArrowRight size={20} />
        </Link>
      </div>
    </div>
  );
}
