import { Link } from 'react-router-dom';
import Logo from './Logo';
import { FacebookIcon, InstagramIcon, LinkedinIcon, YoutubeIcon } from './Icons';
import './Footer.css';

const SOCIAL = [
  { label: 'Instagram', href: 'https://instagram.com', Icon: InstagramIcon },
  { label: 'Facebook', href: 'https://facebook.com', Icon: FacebookIcon },
  { label: 'YouTube', href: 'https://youtube.com', Icon: YoutubeIcon },
  { label: 'LinkedIn', href: 'https://linkedin.com', Icon: LinkedinIcon },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <Logo size={30} />
          <span className="footer__sep" aria-hidden="true" />
          <p className="footer__tagline">
            Tu próximo auto
            <br />
            empieza aquí.
          </p>
        </div>

        <nav className="footer__links" aria-label="Enlaces del pie de página">
          <Link to="/vehiculos">Vehículos</Link>
          <span aria-hidden="true">·</span>
          <Link to="/nosotros">Nosotros</Link>
          <span aria-hidden="true">·</span>
          <Link to="/contacto">Contacto</Link>
          <span aria-hidden="true">·</span>
          <Link to="/ayuda">Preguntas frecuentes</Link>
        </nav>

        <div className="footer__end">
          <p className="footer__tagline">
            Múltiples marcas.
            <br />
            Más historias en el camino.
          </p>
          <span className="footer__sep" aria-hidden="true" />
          <ul className="footer__social">
            {SOCIAL.map(({ label, href, Icon }) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noreferrer" aria-label={label}>
                  <Icon />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="footer__legal">© {new Date().getFullYear()} Tuerka · Inventario de demostración · Precios referenciales</p>
    </footer>
  );
}
