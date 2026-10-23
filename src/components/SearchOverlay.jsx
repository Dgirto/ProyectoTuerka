import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CloseIcon, SearchIcon } from './Icons';
import { formatPrice, typeLabel, vehicleName, vehicles } from '../data/vehicles';
import './SearchOverlay.css';
import { useDialog } from '../hooks/useDialog';
import { matchesQuery } from '../lib/catalogo';

export default function SearchOverlay({ open, onClose }) {
  const [q, setQ] = useState('');
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useDialog(dialogRef, open, onClose, inputRef);

  const results = useMemo(() => (q.trim() ? vehicles.filter((v) => matchesQuery(v, q)) : []), [q]);

  const submit = (e) => {
    e.preventDefault();
    onClose();
    setQ('');
    navigate(q.trim() ? `/vehiculos?q=${encodeURIComponent(q.trim())}` : '/vehiculos');
  };

  if (!open) return null;

  return (
    <div ref={dialogRef} tabIndex={-1} className="search" role="dialog" aria-modal="true" aria-label="Buscar vehículos" onClick={onClose}>
      <div className="search__panel" onClick={(e) => e.stopPropagation()}>
        <form className="search__form" onSubmit={submit} role="search">
          <SearchIcon size={28} />
          <input
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Busca por marca, modelo o tipo…"
            aria-label="Buscar"
          />
          <button type="button" className="search__close" onClick={onClose} aria-label="Cerrar búsqueda">
            <CloseIcon size={26} />
          </button>
        </form>

        {q.trim() && (
          <div className="search__results">
            {results.length === 0 ? (
              <p className="search__empty">No encontramos vehículos para “{q}”.</p>
            ) : (
              <ul>
                {results.map((v) => (
                  <li key={v.id}>
                    <Link to={`/vehiculos/${v.id}`} onClick={onClose}>
                      <img src={v.image} alt="" />
                      <span className="search__name">
                        <strong>{vehicleName(v)}</strong>
                        <small>
                          {v.year} · {typeLabel(v.type)} · {v.transmission}
                        </small>
                      </span>
                      <span className="search__price">US$ {formatPrice(v.price)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <button type="submit" className="search__all" onClick={submit}>
              Ver todos los resultados <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
