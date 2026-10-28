import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, PauseIcon, PlayIcon, VolumeOffIcon, VolumeOnIcon } from './Icons';
import heroVideo from '../assets/hero.mp4';
import brandsVideo from '../assets/marcas.mp4';
import './HeroCarousel.css';

const slides = [
  { src: heroVideo, eyebrow: 'Autos para cada estilo de vida', title: ['Tu próximo', 'camino empieza aquí'], description: 'Encuentra el vehículo que va contigo.', button: 'Explorar vehículos', label: 'Video de portada' },
  { src: brandsVideo, eyebrow: 'Descubre nuestra selección', title: ['Tus marcas favoritas,', 'en un solo lugar'], description: 'Explora las marcas disponibles en nuestro catálogo.', button: 'Explorar marcas', label: 'Nuestras marcas' },
];
const time = (value) => { const s = Math.floor(Number.isFinite(value) ? Math.max(0, value) : 0); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [notice, setNotice] = useState('');
  const videoRef = useRef(null);
  const touchRef = useRef(null);
  const intentRef = useRef(null);
  const slide = slides[index];

  useEffect(() => {
    const video = videoRef.current;
    let active = true;
    if (intentRef.current === null) intentRef.current = !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (intentRef.current) video.play().catch(() => {
      if (active) { setPlaying(false); setNotice('Pulsa reproducir para iniciar el video.'); }
    });
    return () => { active = false; video.pause(); };
  }, [index]);

  function change(next) {
    const target = (next + slides.length) % slides.length;
    if (target === index) return;
    videoRef.current?.pause();
    setPlaying(false); setPosition(0); setDuration(0); setLoading(true); setFailed(false); setNotice(''); setIndex(target);
  }
  async function togglePlay() {
    const video = videoRef.current;
    if (!video || failed) return;
    setNotice('');
    if (video.paused) {
      intentRef.current = true;
      try { await video.play(); } catch {
        if (videoRef.current === video) { intentRef.current = false; setNotice('Pulsa reproducir para reintentar.'); }
      }
    } else { intentRef.current = false; video.pause(); }
  }
  function seek(event) {
    if (!duration || !videoRef.current) return;
    const next = Math.max(0, Math.min(duration, Number(event.target.value)));
    videoRef.current.currentTime = next; setPosition(next);
  }
  function metadata(event) { const d = event.currentTarget.duration; setDuration(Number.isFinite(d) ? d : 0); }
  function touchStart(event) {
    if (event.target.closest('a, button, input')) { touchRef.current = null; return; }
    const t = event.touches[0]; touchRef.current = { x: t.clientX, y: t.clientY };
  }
  function touchEnd(event) {
    const start = touchRef.current; touchRef.current = null;
    if (!start) return;
    const t = event.changedTouches[0], dx = t.clientX - start.x, dy = t.clientY - start.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) change(index + (dx < 0 ? 1 : -1));
  }

  return (
    <section className={`hero hero--video hero--carousel ${index === 1 ? 'hero--brands' : ''}`} aria-label="Portada de Tuerka" aria-roledescription="carrusel" onTouchStart={touchStart} onTouchEnd={touchEnd} onTouchCancel={() => { touchRef.current = null; }}>
      <div className="hero__media" aria-hidden="true">
        <video key={slide.src} ref={videoRef} className="hero__video" src={slide.src} muted={muted} loop playsInline preload="auto" tabIndex={-1}
          onLoadedMetadata={metadata} onDurationChange={metadata} onLoadedData={() => setLoading(false)} onCanPlay={() => setLoading(false)}
          onWaiting={() => setLoading(true)} onPlaying={() => { setPlaying(true); setLoading(false); setNotice(''); }}
          onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => setPosition(e.currentTarget.currentTime)} onSeeked={(e) => setPosition(e.currentTarget.currentTime)}
          onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
          onError={() => { setFailed(true); setPlaying(false); setLoading(false); }} />
      </div>
      <div className="hero__shade" aria-hidden="true" />
      <div className="hero__content container">
        <p className="eyebrow">{slide.eyebrow}</p>
        <h1 className="display hero__title">{slide.title[0]}<br />{slide.title[1]}<span className="text-yellow">.</span></h1>
        <p className="lead">{slide.description}</p>
        <div className="hero__ctas">
          <Link to="/vehiculos" className="btn btn--primary">{slide.button}<ChevronRight size={20} /></Link>
          <Link to="/nosotros" className="btn btn--outline">Conoce Tuerka<ChevronRight size={20} /></Link>
        </div>
        <nav className="hero__navigation" aria-label="Elegir video">
          <button type="button" className="hero__arrow" onClick={() => change(index - 1)} aria-label="Video anterior"><span className="hero__arrow-back"><ChevronRight size={22} /></span></button>
          <div className="hero__dots">{slides.map((item, i) => <button key={item.src} type="button" className="hero__dot" onClick={() => change(i)} aria-label={`Mostrar video ${i + 1}: ${item.label}`} aria-current={index === i ? 'true' : undefined}><span /></button>)}</div>
          <button type="button" className="hero__arrow" onClick={() => change(index + 1)} aria-label="Video siguiente"><ChevronRight size={22} /></button>
          <span className="hero__counter" aria-live="polite">{index + 1} / {slides.length}</span>
        </nav>
        <div className="hero__player">
          <button type="button" className="hero__play" onClick={togglePlay} disabled={failed} aria-label={playing ? 'Pausar video' : 'Reproducir video'}>{playing ? <PauseIcon size={20} /> : <PlayIcon size={18} />}</button>
          <button type="button" className="hero__mute" disabled={failed} onClick={() => { const v = videoRef.current; if (v) { v.muted = !v.muted; setMuted(v.muted); } }} aria-label={muted ? 'Activar sonido' : 'Silenciar video'} aria-pressed={!muted}>{muted ? <VolumeOffIcon size={24} /> : <VolumeOnIcon size={24} />}</button>
          <span className="hero__player-label">{slide.label}</span>
          <input className="hero__timeline" type="range" min="0" max={duration || 1} step="0.01" value={Math.min(position, duration || 0)} style={{ '--video-progress': `${duration ? Math.min(100, position / duration * 100) : 0}%` }} onChange={seek} disabled={!duration || failed} aria-label="Posición del video" aria-valuetext={`${time(position)} de ${time(duration)}`} />
          <span className="hero__time">{time(position)} / {time(duration)}</span>
        </div>
        <p className="hero__status" role="status">{failed ? 'No se pudo cargar este video. Puedes cambiar a la otra portada.' : notice || (loading ? 'Cargando video…' : '')}</p>
      </div>
    </section>
  );
}
