// Iconos de trazo en SVG. Heredan el color con currentColor.
const base = (size, props) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  ...props,
});

const make = (paths) =>
  function Icon({ size = 24, ...props }) {
    return <svg {...base(size, props)}>{paths}</svg>;
  };

export const MenuIcon = make(<><path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" /></>);
export const CloseIcon = make(<><path d="M5 5l14 14" /><path d="M19 5L5 19" /></>);
export const SearchIcon = make(<><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></>);
export const ChevronDown = make(<path d="M6 9l6 6 6-6" />);
export const ChevronRight = make(<path d="M9 6l6 6-6 6" />);
export const ChevronLeft = make(<path d="M15 6l-6 6 6 6" />);
export const ArrowRight = make(<><path d="M4 12h16" /><path d="M14 6l6 6-6 6" /></>);
export const PauseIcon = make(<><path d="M10 8v8" /><path d="M14 8v8" /></>);
export const PlayIcon = make(<path d="M9 7l8 5-8 5z" fill="currentColor" />);
export const InfoIcon = make(<><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" /></>);
export const TagIcon = make(<><path d="M3 12V4h8l10 10-8 8z" /><circle cx="7.5" cy="7.5" r="1.3" /></>);
export const DollarIcon = make(<><circle cx="12" cy="12" r="9" /><path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .8-3 2s1.3 1.7 3 2 3 .8 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5" /><path d="M12 6v12" /></>);
export const CalendarIcon = make(<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18" /><path d="M8 3v4" /><path d="M16 3v4" /></>);
export const CalendarCheckIcon = make(<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18" /><path d="M8 3v4" /><path d="M16 3v4" /><path d="M9 15l2 2 4-4" /></>);
export const GaugeIcon = make(<><path d="M4 17a8 8 0 1116 0" /><path d="M12 17l4-5" /><path d="M7 13h.01M12 9h.01M17 13h.01" /></>);
export const GearsIcon = make(<><circle cx="6" cy="5" r="1.6" /><circle cx="12" cy="5" r="1.6" /><circle cx="18" cy="5" r="1.6" /><circle cx="6" cy="19" r="1.6" /><circle cx="12" cy="19" r="1.6" /><path d="M6 6.6v10.8M12 6.6v10.8M18 6.6V12H6" /></>);
export const FuelIcon = make(<><path d="M4 21V5a2 2 0 012-2h7a2 2 0 012 2v16" /><path d="M3 21h13" /><path d="M7 8h5" /><path d="M15 10h2a2 2 0 012 2v4a1.5 1.5 0 003 0V8l-3-3" /></>);
export const TrashIcon = make(<><path d="M4 7h16" /><path d="M9 7V4h6v3" /><path d="M6 7l1 14h10l1-14" /><path d="M10 11v6M14 11v6" /></>);
export const CompassIcon = make(<><circle cx="12" cy="12" r="10" /><path d="M16 8l-2.5 5.5L8 16l2.5-5.5z" /></>);
export const ChatIcon = make(<><path d="M4 4h16v12H9l-5 4z" /><path d="M8 9h8M8 12h5" /></>);
export const DocIcon = make(<><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5" /><path d="M9 12h7M9 15h7M9 18h4" /></>);
export const UserIcon = make(<><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4-6 8-6s7 2 8 6z" /></>);
export const CheckIcon = make(<path d="M5 12l5 5 9-10" />);

export function HeartIcon({ size = 24, filled = false, ...props }) {
  return (
    <svg {...base(size, props)} fill={filled ? 'currentColor' : 'none'}>
      <path d="M12 20s-7.5-4.6-9.2-9.3C1.7 7.6 3.7 4.5 7 4.5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3.3 0 5.3 3.1 4.2 6.2C19.5 15.4 12 20 12 20z" />
    </svg>
  );
}

// Siluetas de vehículos para las categorías
const car = (body) =>
  function CarIcon({ size = 32, ...props }) {
    return (
      <svg {...base(size, props)} viewBox="0 0 40 24" strokeWidth={1.5}>
        {body}
        <circle cx="11" cy="17" r="3" />
        <circle cx="29" cy="17" r="3" />
      </svg>
    );
  };

export const CarUrban = car(<path d="M8 17H4v-4l3-5h14l5 5h7l2 2v2h-3M14 17h12M8 13h22" />);
export const CarSedan = car(<path d="M8 17H3v-3l5-1 5-5h11l6 5 6 1v3h-3M14 17h12" />);
export const CarSuv = car(<path d="M8 17H4V9l2-3h20l6 6 4 1v4h-4M14 17h12M6 11h28M16 6v5M24 6v5" />);
export const CarPickup = car(<path d="M8 17H3v-5h11V6h9l4 6h9v5h-4M14 17h12M14 12h13" />);
export const CarSport = car(<path d="M8 17H2v-2l6-2 6-4h9l7 4 7 1v3h-4M14 17h12" />);
export const CarVan = car(<path d="M8 17H4V5h20l6 6h5v6h-3M14 17h12M24 5v6h6" />);

export const TYPE_ICONS = {
  urbano: CarUrban,
  sedan: CarSedan,
  suv: CarSuv,
  pickup: CarPickup,
  deportivo: CarSport,
  comercial: CarVan,
};

// Redes sociales (relleno)
const social = (path) =>
  function SocialIcon({ size = 22, ...props }) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
        {path}
      </svg>
    );
  };

export const InstagramIcon = social(
  <path d="M12 2.2c3.2 0 3.6 0 4.8.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 3.9 3.9 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.1 0-3.5 0-4.7.1-2.4.1-3.5 1.2-3.6 3.6C3.6 8.9 3.6 9.3 3.6 12s0 3.1.1 4.3c.1 2.4 1.2 3.5 3.6 3.6 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c2.4-.1 3.5-1.2 3.6-3.6.1-1.2.1-1.6.1-4.3s0-3.1-.1-4.3c-.1-2.4-1.2-3.5-3.6-3.6C15.5 4 15.1 4 12 4zm0 3.1a4.9 4.9 0 110 9.8 4.9 4.9 0 010-9.8zm0 8.1a3.2 3.2 0 100-6.4 3.2 3.2 0 000 6.4zm5.1-9.4a1.2 1.2 0 110 2.3 1.2 1.2 0 010-2.3z" />
);
export const FacebookIcon = social(
  <path d="M14 8.5V6.6c0-.9.6-1.1 1-1.1h2.6V1.6L14 1.6c-4 0-4.9 3-4.9 4.9v2H6.8v4h2.3V22H14v-9.5h3.3l.4-4z" />
);
export const YoutubeIcon = social(
  <path d="M23 7.2a3 3 0 00-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 001 7.2 31 31 0 00.5 12 31 31 0 001 16.8a3 3 0 002.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 002.1-2.1 31 31 0 00.5-4.8 31 31 0 00-.5-4.8zM9.7 15V9l5.8 3z" />
);
export const LinkedinIcon = social(
  <path d="M4.98 3.5a2.5 2.5 0 110 5 2.5 2.5 0 010-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.2c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21h-4z" />
);
