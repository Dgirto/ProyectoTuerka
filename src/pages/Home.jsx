import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  DollarIcon,
  InfoIcon,
  TagIcon,
  TYPE_ICONS,
  CarSedan,
  ArrowRight,
} from '../components/Icons';

import { Select } from '../components/ui';
import VehicleCard from '../components/VehicleCard';

import {
  BRANDS,
  BUDGETS,
  VEHICLE_TYPES,
  vehicles,
} from '../data/vehicles';

import HeroCarousel from '../components/HeroCarousel';

import './Home.css';

export default function Home() {
  const navigate = useNavigate();

  const [tipo, setTipo] = useState('');
  const [marca, setMarca] = useState('');
  const [presupuesto, setPresupuesto] = useState('');

  const search = (event) => {
    event.preventDefault();

    const params = new URLSearchParams();

    if (tipo) params.set('tipo', tipo);
    if (marca) params.set('marca', marca);
    if (presupuesto) {
      params.set('presupuesto', presupuesto);
    }

    const query = params.toString();

    navigate(`/vehiculos${query ? `?${query}` : ''}`);
  };

  return (
    <div className="home">
      <HeroCarousel />

      <section
        className="finder"
        aria-labelledby="finder-title"
      >
        <div className="finder__inner container">
          <h2
            id="finder-title"
            className="display finder__title"
          >
            Encuentra
            <br />
            el tuyo
            <span className="text-yellow">/</span>
          </h2>

          <div className="finder__main">
            <form
              className="finder__form"
              onSubmit={search}
            >
              <Select
                label="Tipo de vehículo"
                placeholder="Tipo de vehículo"
                icon={CarSedan}
                value={tipo}
                onChange={setTipo}
                options={VEHICLE_TYPES.map((type) => ({
                  value: type.id,
                  label: type.label,
                }))}
              />

              <Select
                label="Marca"
                placeholder="Marca"
                icon={TagIcon}
                value={marca}
                onChange={setMarca}
                options={BRANDS.map((brand) => ({
                  value: brand,
                  label: brand,
                }))}
              />

              <Select
                label="Presupuesto"
                placeholder="Presupuesto"
                icon={DollarIcon}
                value={presupuesto}
                onChange={setPresupuesto}
                options={BUDGETS.map((budget) => ({
                  value: budget.id,
                  label: budget.label,
                }))}
              />

              <button
                type="submit"
                className="btn btn--primary finder__submit"
              >
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-4-4" />
                </svg>
                Buscar
              </button>
            </form>

            <div className="finder__cats">
              <ul>
                {VEHICLE_TYPES.map((type) => {
                  const Icon = TYPE_ICONS[type.id];

                  return (
                    <li key={type.id}>
                      <Link
                        to={`/vehiculos?tipo=${type.id}`}
                      >
                        <Icon size={40} />
                        <span>{type.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <p className="finder__note">
                <InfoIcon size={20} />
                Precios referenciales
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="featured container">
        <div className="featured__head">
          <div>
            <p className="eyebrow">
              Selección Tuerka
            </p>

            <h2
              id="featured-title"
              className="display featured__title"
            >
              Destacados{' '}
              <span className="text-yellow">
                de la semana.
              </span>
            </h2>
          </div>

          <Link
            to="/vehiculos"
            className="btn btn--outline-yellow"
          >
            Ver catálogo
            <ArrowRight size={20} />
          </Link>
        </div>

        <div className="featured__grid">
          {vehicles.slice(0, 3).map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
            />
          ))}
        </div>
      </section>
    </div>
  );
}