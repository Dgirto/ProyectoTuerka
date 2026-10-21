import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CloseIcon, SearchIcon } from './Icons';
import { formatPrice, typeLabel, vehicleName, vehicles } from '../data/vehicles';
import './SearchOverlay.css';

export function matchesQuery(v, q) {
  const text = `${v.brand} ${v.model} ${typeLabel(v.type)} ${v.year} ${v.transmission} ${v.fuel}`.toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => text.includes(word));
}

export default function SearchOverlay({ open, onClose }) {
  const [q, setQ] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return undefined;
    setQ('');
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const results = useMemo(() => (q.trim() ? vehicles.filter((v) => matchesQuery(v, q)) : []), [q]);

  const submit = (e) => {
    e.preventDefault();
    onClose();
    navigate(q.trim() ? `/vehiculos?q=${encodeURIComponent(q.trim())}` : '/vehiculos');
  };

  if (!open) return null;

  return (
    <div className="search" role="dialog" aria-modal="true" aria-label="Buscar vehículos" onClick={onClose}>
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
