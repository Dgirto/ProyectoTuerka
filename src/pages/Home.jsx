import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  ChevronRight,
  DollarIcon,
  InfoIcon,
  PauseIcon,
  PlayIcon,
  TagIcon,
  TYPE_ICONS,
  CarSedan,
  ArrowRight,
  VolumeOffIcon,
  VolumeOnIcon,
} from '../components/Icons';

import { Select } from '../components/ui';
import VehicleCard from '../components/VehicleCard';

import {
  BRANDS,
  BUDGETS,
  VEHICLE_TYPES,
  vehicles,
} from '../data/vehicles';

import heroVideo from '../assets/hero.mp4';

import './Home.css';

function formatTime(seconds) {
  const total = Math.floor(
    Number.isFinite(seconds) ? seconds : 0
  );

  return `${Math.floor(total / 60)}:${String(
    total % 60
  ).padStart(2, '0')}`;
}

function useHeroVideo() {
  const heroRef = useRef(null);
  const videoRef = useRef(null);
  const progressRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [duration, setDuration] = useState(0);
  const [failed, setFailed] = useState(false);

  const updateProgress = () => {
    const video = videoRef.current;
    const slider = progressRef.current;

    if (!video || !slider) return;

    const total = Number.isFinite(video.duration)
      ? video.duration
      : 0;

    const current = video.currentTime || 0;
    const percent = total
      ? Math.min(100, Math.max(0, (current / total) * 100))
      : 0;

    slider.value = String(current);
    slider.style.setProperty(
      '--video-progress',
      `${percent}%`
    );

    slider.setAttribute(
      'aria-valuetext',
      `${current.toFixed(1)} de ${total.toFixed(1)} segundos`
    );
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let active = true;
    let frame;
    let autoplayAttempted = false;

    video.muted = true;

    const updateMetadata = () => {
      setDuration(
        Number.isFinite(video.duration)
          ? video.duration
          : 0
      );

      updateProgress();
    };

    const startOnce = () => {
      if (autoplayAttempted || video.readyState < 2) return;

      autoplayAttempted = true;

      // Respeta la preferencia de movimiento reducido.
      if (
        window.matchMedia?.(
          '(prefers-reduced-motion: reduce)'
        ).matches
      ) {
        return;
      }

      video.play()?.catch(() => {
        if (active && video.paused) setPlaying(false);
      });
    };

    const tick = () => {
      updateProgress();

      if (active && !video.paused) {
        frame = requestAnimationFrame(tick);
      }
    };

    const onPlay = () => {
      setPlaying(true);
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(tick);
    };

    const onPause = () => {
      setPlaying(false);
      cancelAnimationFrame(frame);
      updateProgress();
    };

    const onVolumeChange = () => {
      setMuted(video.muted);
    };

    const onError = () => {
      setFailed(true);
      setPlaying(false);
      cancelAnimationFrame(frame);
    };

    const events = {
      loadedmetadata: updateMetadata,
      durationchange: updateMetadata,
      loadeddata: startOnce,
      canplay: startOnce,
      play: onPlay,
      pause: onPause,
      timeupdate: updateProgress,
      seeked: updateProgress,
      volumechange: onVolumeChange,
      error: onError,
    };

    Object.entries(events).forEach(([name, handler]) => {
      video.addEventListener(name, handler);
    });

    updateMetadata();
    startOnce();

    return () => {
      active = false;
      cancelAnimationFrame(frame);

      Object.entries(events).forEach(([name, handler]) => {
        video.removeEventListener(name, handler);
      });

      video.pause();
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video || failed) return;

    if (video.paused) {
      video.play()?.catch(() => {
        if (video.paused) setPlaying(false);
      });
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const seek = (event) => {
    const video = videoRef.current;
    if (!video || !duration) return;

    video.currentTime = Math.min(
      duration,
      Math.max(0, Number(event.target.value))
    );

    updateProgress();
  };

  return {
    heroRef,
    videoRef,
    progressRef,
    playing,
    muted,
    duration,
    failed,
    togglePlay,
    toggleMute,
    seek,
  };
}

export default function Home() {
  const navigate = useNavigate();
  const hv = useHeroVideo();

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
      <section
        ref={hv.heroRef}
        className="hero hero--video"
      >
        <div className="hero__media" aria-hidden="true">
          <video
            ref={hv.videoRef}
            className="hero__video"
            src={heroVideo}
            muted
            loop
            playsInline
            preload="auto"
            tabIndex={-1}
          />
        </div>

        <div
          className="hero__shade"
          aria-hidden="true"
        />

        <div className="hero__content container">
          <p className="eyebrow">
            Autos para cada estilo de vida
          </p>

          <h1 className="display hero__title">
            Tu próximo
            <br />
            camino empieza aquí
            <span className="text-yellow">.</span>
          </h1>

          <p className="lead">
            Encuentra el vehículo que va contigo.
          </p>

          <div className="hero__ctas">
            <Link
              to="/vehiculos"
              className="btn btn--primary"
            >
              Explorar vehículos
              <ChevronRight size={20} />
            </Link>

            <Link
              to="/nosotros"
              className="btn btn--outline"
            >
              Conoce Tuerka
              <ChevronRight size={20} />
            </Link>
          </div>

          <div className="hero__player">
            <button
              type="button"
              className="hero__play"
              onClick={hv.togglePlay}
              disabled={hv.failed}
              aria-label={
                hv.playing
                  ? 'Pausar video de portada'
                  : 'Reproducir video de portada'
              }
            >
              {hv.playing ? (
                <PauseIcon size={20} />
              ) : (
                <PlayIcon size={18} />
              )}
            </button>

            <button
              type="button"
              className="hero__mute"
              onClick={hv.toggleMute}
              disabled={hv.failed}
              aria-label={
                hv.muted
                  ? 'Activar sonido del video'
                  : 'Silenciar video'
              }
              aria-pressed={!hv.muted}
            >
              {hv.muted ? (
                <VolumeOffIcon size={24} />
              ) : (
                <VolumeOnIcon size={24} />
              )}
            </button>

            <span className="hero__player-label">
              Video de portada
            </span>

            <input
              ref={hv.progressRef}
              type="range"
              className="hero__timeline"
              min="0"
              max={hv.duration || 1}
              step="0.01"
              defaultValue="0"
              onChange={hv.seek}
              disabled={!hv.duration || hv.failed}
              aria-label="Posición del video de portada"
            />
          </div>

          {hv.failed && (
            <p className="hero__video-error" role="status">
              No se pudo cargar el video. Recarga la página
              para intentarlo nuevamente.
            </p>
          )}
        </div>
      </section>

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