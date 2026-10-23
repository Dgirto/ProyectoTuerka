import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs, Select } from '../components/ui';
import { faqs } from '../data/faqs';
import './Help.css';
const normalize = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const groups = [...new Set(faqs.map((f) => f.group))];
export default function Help() {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('');
  const results = useMemo(() => faqs.filter((f) => (!group || f.group === group) && normalize(`${f.question} ${f.answer}`).includes(normalize(query.trim()))), [query, group]);
  return <div className="page help container">
    <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Preguntas frecuentes' }]} />
    <header className="help__head"><p className="eyebrow">Te acompañamos en el camino</p>
      <h1 className="display">Resuelve tus <span className="text-yellow">dudas.</span></h1>
      <p className="lead">Lo que necesitas saber para explorar, comparar y coordinar tu próxima visita.</p>
    </header>
    <div className="help__layout">
      <aside className="help__contact"><h2 className="display">Hablemos de <span className="text-yellow">tu próximo auto.</span></h2>
        <p>Si necesitas confirmar disponibilidad o resolver una consulta específica, cuéntanos qué vehículo te interesa.</p>
        <Link className="btn btn--primary btn--block" to="/contacto">Contactar a un asesor</Link>
      </aside>
      <section aria-label="Preguntas frecuentes">
        <div className="help__filters"><label>Buscar una duda<input type="search" className="field-input" placeholder="Ej. favoritos, visita, cuotas…" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
          <div><span className="help__label">Tema</span><Select label="Tema" placeholder="Todos los temas" value={group} onChange={setGroup} options={groups.map((g) => ({ value: g, label: g }))} /></div>
        </div>
        <p className="help__count" role="status">{results.length} {results.length === 1 ? 'respuesta' : 'respuestas'}</p>
        {results.map((faq) => <details className="help__item" key={faq.id}><summary>{faq.question}</summary><div><p>{faq.answer}</p><Link to={faq.to}>{faq.link} →</Link></div></details>)}
        {!results.length && <div className="help__empty"><h2>No encontramos esa pregunta</h2><p>Prueba con otra palabra o consulta todos los temas.</p><button className="btn btn--outline" type="button" onClick={() => { setQuery(''); setGroup(''); }}>Ver todas las preguntas</button></div>}
      </section>
    </div>
  </div>;
}
