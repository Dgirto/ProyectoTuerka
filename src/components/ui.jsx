import { Link } from 'react-router-dom';
import { ChevronDown } from './Icons';

// Select nativo con estilo propio (accesible y funcional en móvil).
export function Select({ value, onChange, options, icon: Icon, label, placeholder, className = '', ...props }) {
  return (
    <label className={`select ${Icon ? 'select--icon' : ''} ${className}`}>
      {Icon && <Icon size={26} className="select__icon" />}
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown size={18} className="select__chevron" />
    </label>
  );
}

export function Breadcrumbs({ items }) {
  return (
    <nav className="breadcrumbs" aria-label="Ruta de navegación">
      <ol>
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.label}>
              {last || !item.to ? (
                <span aria-current={last ? 'page' : undefined}>{item.label}</span>
              ) : (
                <Link to={item.to}>{item.label}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
