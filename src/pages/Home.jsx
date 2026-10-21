import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, DollarIcon, InfoIcon, PauseIcon, PlayIcon, TagIcon, TYPE_ICONS, CarSedan, ArrowRight } from '../components/Icons';
import { Select } from '../components/ui';
import VehicleCard from '../components/VehicleCard';
import { BRANDS, BUDGETS, VEHICLE_TYPES, vehicles } from '../data/vehicles';
import hero from '../assets/hero-1.jpg';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const [playing, setPlaying] = useState(true);
  const [tipo, setTipo] = useState('');
  const [marca, setMarca] = useState('');
  const [presupuesto, setPresupuesto] = useState('');

  const search = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (tipo) params.set('tipo', tipo);
    if (marca) params.set('marca', marca);
    if (presupuesto) params.set('presupuesto', presupuesto);
    navigate(`/vehiculos${params.toString() ? `?${params}` : ''}`);
  };

  return (
    <div className="home">
      <section className={`hero ${playing ? '' : 'hero--paused'}`}>
        <div className="hero__media" aria-hidden="true">
          <img src={hero} alt="" />
        </div>
        <div className="hero__shade" aria-hidden="true" />

        <div className="hero__content container">
          <p className="eyebrow">Autos para cada estilo de vida</p>
          <h1 className="display hero__title">
            Tu próximo
            <br />
            camino empieza aquí<span className="text-yellow">.</span>
          </h1>
          <p className="lead">Encuentra el vehículo que va contigo.</p>
          <div className="hero__ctas">
            <Link to="/vehiculos" className="btn btn--primary">
              Explorar vehículos <ChevronRight size={20} />
            </Link>
            <Link to="/nosotros" className="btn btn--outline">
              Conoce Tuerka <ChevronRight size={20} />
            </Link>
          </div>

          <div className="hero__player">
            <button
              type="button"
              className="hero__play"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? 'Pausar portada' : 'Reproducir portada'}
            >
              {playing ? <PauseIcon size={20} /> : <PlayIcon size={18} />}
            </button>
            <span className="hero__player-label">Video de portada</span>
            <span className="hero__progress" aria-hidden="true">
              <span />
            </span>
          </div>
        </div>
      </section>

      <section className="finder" aria-labelledby="finder-title">
        <div className="finder__inner container">
          <h2 id="finder-title" className="display finder__title">
            Encuentra
            <br />
            el tuyo<span className="text-yellow">/</span>
          </h2>

          <div className="finder__main">
            <form className="finder__form" onSubmit={search}>
              <Select
                label="Tipo de vehículo"
                placeholder="Tipo de vehículo"
                icon={CarSedan}
                value={tipo}
                onChange={setTipo}
                options={VEHICLE_TYPES.map((t) => ({ value: t.id, label: t.label }))}
              />
              <Select
                label="Marca"
                placeholder="Marca"
                icon={TagIcon}
                value={marca}
                onChange={setMarca}
                options={BRANDS.map((b) => ({ value: b, label: b }))}
              />
              <Select
                label="Presupuesto"
                placeholder="Presupuesto"
                icon={DollarIcon}
                value={presupuesto}
                onChange={setPresupuesto}
                options={BUDGETS.map((b) => ({ value: b.id, label: b.label }))}
              />
              <button type="submit" className="btn btn--primary finder__submit">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-4-4" />
                </svg>
                Buscar
              </button>
            </form>

            <div className="finder__cats">
              <ul>
                {VEHICLE_TYPES.map((t) => {
                  const Icon = TYPE_ICONS[t.id];
                  return (
                    <li key={t.id}>
                      <Link to={`/vehiculos?tipo=${t.id}`}>
                        <Icon size={40} />
                        <span>{t.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <p className="finder__note">
                <InfoIcon size={20} /> Precios referenciales
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="featured container" aria-labelledby="featured-title">
        <div className="featured__head">
          <div>
            <p className="eyebrow">Selección Tuerka</p>
            <h2 id="featured-title" className="display featured__title">
              Destacados <span className="text-yellow">de la semana.</span>
            </h2>
          </div>
          <Link to="/vehiculos" className="btn btn--outline-yellow">
            Ver catálogo <ArrowRight size={20} />
          </Link>
        </div>
        <div className="featured__grid">
          {vehicles.slice(0, 3).map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      </section>
    </div>
  );
}
