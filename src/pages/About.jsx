import { Link } from 'react-router-dom';
import { ArrowRight, DocIcon, SearchIcon, UserIcon } from '../components/Icons';
import showroom from '../assets/showroom.jpg';
import './About.css';

const STEPS = [
  { n: '01', title: 'Encuentra', text: 'Explora por estilo y presupuesto.', Icon: SearchIcon, to: '/vehiculos' },
  { n: '02', title: 'Conoce', text: 'Revisa cada detalle y agenda una visita.', Icon: DocIcon, to: '/contacto#agenda' },
  { n: '03', title: 'Decide', text: 'Resuelve tus dudas con un asesor.', Icon: UserIcon, to: '/contacto' },
];

export default function About() {
  return (
    <div className="page about">
      <section className="about__hero">
        <div className="about__copy">
          <p className="eyebrow">Somos Tuerka</p>
          <h1 className="display about__title">
            Cada camino
            <br />
            <span className="text-yellow">tiene una historia</span>.
          </h1>
          <p>Conectamos personas con vehículos que encajan en su vida.</p>
          <p>Una experiencia clara para explorar, comparar y dar el siguiente paso.</p>
          <Link to="/vehiculos" className="btn btn--primary">
            Explorar vehículos <ArrowRight size={22} />
          </Link>
        </div>
        <img className="about__img" src={showroom} alt="Asesor de Tuerka mostrando un vehículo a una pareja en el showroom" />
      </section>

      <section className="about__steps" id="como-comprar" aria-labelledby="steps-title">
        <h2 id="steps-title" className="display about__steps-title">
          Así empieza tu
          <br />
          <span className="text-yellow">próximo viaje.</span>
        </h2>
        <ol>
          {STEPS.map(({ n, title, text, Icon, to }) => (
            <li key={n}>
              <Link to={to}>
                <span className="about__num" aria-hidden="true">
                  {n}
                </span>
                <span>
                  <Icon size={38} />
                  <strong>{title}</strong>
                  <small>{text}</small>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
      <div className="about__help"><Link to="/ayuda" className="btn btn--outline">¿Tienes dudas? Revisa nuestras preguntas frecuentes</Link></div>
    </div>
  );
}
