import { Link } from 'react-router-dom';
import { ArrowRight, HeartIcon } from './Icons';
import { useFavorites } from '../context/FavoritesContext';
import { formatPrice, vehicleName } from '../data/vehicles';
import { useReservados } from '../hooks/useReservados';
import './ReservaBox.css';
import './VehicleCard.css';

export function FavoriteButton({ id, name, className = '' }) {
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(id);
  return (
    <button
      type="button"
      className={`fav-btn ${active ? 'fav-btn--active' : ''} ${className}`}
      onClick={(e) => {
        e.preventDefault();
        toggle(id);
      }}
      aria-pressed={active}
      aria-label={active ? `Quitar ${name} de favoritos` : `Guardar ${name} en favoritos`}
    >
      <HeartIcon size={24} filled={active} />
    </button>
  );
}

export default function VehicleCard({ vehicle }) {
  const name = vehicleName(vehicle);
  const reservado = useReservados().has(vehicle.id);
  return (
    <article className="vcard">
      {reservado && <span className="vcard__reservado">Reservado</span>}
      <Link to={`/vehiculos/${vehicle.id}`} className="vcard__media" tabIndex={-1} aria-hidden="true">
        <img src={vehicle.image} alt="" loading="lazy" />
      </Link>
      <FavoriteButton id={vehicle.id} name={name} className="vcard__fav" />
      <div className="vcard__body">
        <p className="vcard__meta">
          {vehicle.year} · {vehicle.transmission}
        </p>
        <h3 className="vcard__title">
          <Link to={`/vehiculos/${vehicle.id}`}>{name}</Link>
        </h3>
        <div className="vcard__row">
          <p className="vcard__price">US$ {formatPrice(vehicle.price)}</p>
          <Link to={`/vehiculos/${vehicle.id}`} className="vcard__link">
            Ver vehículo <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </article>
  );
}
