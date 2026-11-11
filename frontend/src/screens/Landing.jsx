import { useCallback, useEffect, useRef, useState } from 'react';
import mapaImg from '../assets/mapa-peru.png';
import imgLogin from '../assets/landing/login.jpg';
import imgAvatar from '../assets/landing/avatar.jpg';
import imgMapa from '../assets/landing/mapa.jpg';
import imgJuego from '../assets/landing/juego.jpg';
import imgPregunta from '../assets/landing/pregunta.jpg';
import '../styles/landing.css';

// Página de inicio. "Jugar" lleva a la pantalla de inicio de sesión (onJugar).
// Las capturas están en src/assets/landing/ (se pueden reemplazar por otras del mismo nombre).

const PASOS = [
  { k: 'k1', titulo: 'Entra al juego.',      texto: 'Inicia sesión con tu correo institucional o prueba la demo.',            img: imgLogin,    alt: 'Inicio de sesión' },
  { k: 'k2', titulo: 'Crea tu personaje.',   texto: 'Elige cómo te verás corriendo por el Perú.',                             img: imgAvatar,   alt: 'Personaje' },
  { k: 'k3', titulo: 'Elige zona y reto.',   texto: 'Cada zona desbloquea la siguiente. Escoge Fácil, Intermedio o Difícil.', img: imgMapa,     alt: 'Mapa' },
  { k: 'k4', titulo: 'Corre y esquiva.',     texto: 'Cambia de carril, salta y agáchate. Cuida tus vidas.',                   img: imgJuego,    alt: 'Juego' },
  { k: 'k5', titulo: '¡Pregunta sorpresa!',  texto: 'Responde antes de que se acabe el tiempo.',                              img: imgPregunta, alt: 'Pregunta' },
];

const ZONAS = [
  { d: '', p: '70% 0%',    em: '🏔️', nivel: 'NIVEL 1 · UNIDAD 1', nombre: 'Sierra Andina',      texto: 'Estructura Secuencial: algoritmos, lógica, pseudocódigo y tipos de dato.' },
  { d: 'd1', p: '100% 100%', em: '🌿', nivel: 'NIVEL 2 · UNIDAD 2', nombre: 'Amazonía',           texto: 'Estructuras Condicionales: Si, SiNo, Según y operadores lógicos.' },
  { d: '', p: '0% 45%',    em: '🌊', nivel: 'NIVEL 3 · UNIDAD 3', nombre: 'Costa del Pacífico', texto: 'Estructuras Repetitivas: Para, Mientras y Repetir-HastaQue.' },
  { d: 'd1', p: '45% 55%',  em: '🏙️', nivel: 'NIVEL FINAL',        nombre: 'Lima Urbana',        texto: 'Todo el sílabo mezclado, con más velocidad y dificultad.' },
];

const DIFICULTADES = [
  { d: '',   g: 'gc', n: '6', nombre: 'Fácil',      hh: '❤️❤️❤️', items: ['Velocidad baja', 'Solo opción múltiple'] },
  { d: 'd1', g: 'gy', n: '4', nombre: 'Intermedio', hh: '❤️❤️',   items: ['Velocidad media', 'Opción múltiple y código'] },
  { d: 'd2', g: 'gx', n: '2', nombre: 'Difícil',    hh: '❤️',     items: ['Velocidad alta · golpes dobles', 'Solo código PSeInt'] },
];

const FAQ = [
  ['¿Necesito una cuenta para probarlo?', 'No. En la pantalla de inicio puedes pulsar “Ver demo” y jugar sin cuenta. Para guardar tu puntaje en el ranking sí necesitas registrarte.'],
  ['¿Qué voy a aprender?', 'Las tres unidades del curso: estructura secuencial, estructuras condicionales y estructuras repetitivas, con pseudocódigo en PSeInt.'],
  ['¿Cómo se controla?', 'Con el teclado: flechas o A y D para cambiar de carril, Espacio, ↑ o W para saltar (doble salto en el aire) y ↓ o S para agacharte.'],
  ['¿Qué pasa si pierdo todas mis vidas?', 'Tienes un reto para revivir una sola vez por partida. Si lo resuelves, vuelves con algunas vidas; si no, termina la partida.'],
  ['¿Cuántas dificultades hay?', 'Tres: Fácil (6 vidas, solo opción múltiple), Intermedio (4 vidas, opción múltiple y código) y Difícil (2 vidas, solo código PSeInt).'],
];

const ALUMNOS = [['Alumno 1', '92%', '0980'], ['Alumno 2', '78%', '0870'], ['Alumno 3', '64%', '0750'], ['Alumno 4', '45%', '0520'], ['Errores', '30%', 'U2']];

export default function Landing({ onJugar }) {
  const raiz = useRef(null);
  const rail = useRef(null);
  const [cur, setCur]   = useState(0);   // paso activo del carrusel
  const [tick, setTick] = useState(0);   // reinicia el temporizador y la barra de progreso
  const curRef = useRef(0);
  useEffect(() => { curRef.current = cur; }, [cur]);

  const ir = (id) => (e) => {
    e.preventDefault();
    raiz.current?.querySelector(`#${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ── Carrusel ──
  const margen = () => (rail.current ? parseFloat(getComputedStyle(rail.current).scrollPaddingLeft) || 0 : 0);
  const ver = useCallback((k) => {
    const el = rail.current?.children[k];
    if (!el) return;
    rail.current.scrollTo({ left: el.offsetLeft - margen(), behavior: 'smooth' });
    setCur(k);
    setTick((t) => t + 1);
  }, []);

  // Avanza solo cada 6 s.
  useEffect(() => {
    const t = setTimeout(() => ver((cur + 1) % PASOS.length), 6000);
    return () => clearTimeout(t);
  }, [cur, tick, ver]);

  // Si la persona desliza a mano, el punto activo sigue a la tarjeta más cercana.
  const alDeslizar = useRef(null);
  const onScrollRail = () => {
    clearTimeout(alDeslizar.current);
    alDeslizar.current = setTimeout(() => {
      const r = rail.current; if (!r) return;
      let mejor = 0, dist = Infinity;
      [...r.children].forEach((c, k) => {
        const d = Math.abs(c.offsetLeft - margen() - r.scrollLeft);
        if (d < dist) { dist = d; mejor = k; }
      });
      if (mejor !== curRef.current) { setCur(mejor); setTick((t) => t + 1); }
    }, 120);
  };
  useEffect(() => () => clearTimeout(alDeslizar.current), []);

  // ── Aparición al hacer scroll + contadores ──
  useEffect(() => {
    const contar = (el) => {
      const n = +el.dataset.n, s = el.dataset.s || '';
      let t0 = null;
      const f = (ts) => {
        t0 = t0 ?? ts;
        const p = Math.min((ts - t0) / 1200, 1);
        el.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))) + (p === 1 ? s : '');
        if (p < 1) requestAnimationFrame(f);
      };
      requestAnimationFrame(f);
    };
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('ld-on');
        e.target.querySelectorAll('[data-n]').forEach(contar);
        io.unobserve(e.target);
      });
    }, { threshold: 0.15 });
    raiz.current.querySelectorAll('.rv').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="landing" ref={raiz} style={{ '--map': `url(${mapaImg})` }}>
      <nav>
        <a className="brand" href="#top" onClick={ir('top')}><b>🏃</b>PSeInt RUNNER</a>
        <ul>
          <li><a href="#beneficios" onClick={ir('beneficios')}>Beneficios</a></li>
          <li><a href="#como" onClick={ir('como')}>Cómo funciona</a></li>
          <li><a href="#zonas" onClick={ir('zonas')}>Zonas</a></li>
          <li><a href="#docentes" onClick={ir('docentes')}>Docentes</a></li>
          <li><a href="#faq" onClick={ir('faq')}>Preguntas</a></li>
        </ul>
        <button className="ld-btn sm" onClick={onJugar}>▶ Jugar</button>
      </nav>

      <header className="hero" id="top">
        <div className="eb px">▶ PRESS START</div>
        <h1>Aprende PSeInt<br /><span className="gx">corriendo por el Perú.</span></h1>
        <p className="sub">Esquiva combis, saltos y huecos. Responde preguntas sorpresa del sílabo. Conquista las 4 zonas.</p>
        <div className="cta">
          <button className="ld-btn" onClick={onJugar}>▶ Jugar ahora</button>
          <a className="ld-btn gh" href="#como" onClick={ir('como')}>Ver cómo funciona</a>
        </div>
        <div className="tags"><span>✓ Demo sin cuenta</span><span>·</span><span>✓ 3 dificultades</span><span>·</span><span>✓ Con ranking</span></div>
        <div className="stage">
          <div className="chip a">❤️❤️❤️ x3</div><div className="chip b">★ 0120</div><div className="chip c">🏔️ SIERRA ANDINA</div>
          <div className="crt"><img src={imgJuego} alt="Captura del juego PSeInt Runner" /></div>
        </div>
      </header>

      <div className="stats"><div className="w">
        <div className="rv"><b className="gx" data-n="4">0</b><span>zonas del Perú</span></div>
        <div className="rv d1"><b className="gc" data-n="3">0</b><span>niveles de dificultad</span></div>
        <div className="rv d2"><b className="gy" data-n="3">0</b><span>unidades del sílabo</span></div>
        <div className="rv d3"><b className="gx" data-n="32" data-s="+">0</b><span>preguntas para dominar</span></div>
      </div></div>

      <section className="sec" id="beneficios"><div className="in">
        <span className="kick px rv">POR QUÉ JUGARLO</span>
        <h2 className="rv">Estudiar nunca fue<br /><span className="gc">tan veloz.</span></h2>
        <p className="lead rv d1">Practicas lógica, condicionales y bucles sin darte cuenta, mientras evitas obstáculos.</p>
        <div className="bento">
          <div className="bx s4 f1 rv"><span className="tg">PREGUNTAS SORPRESA</span><h3>Aprendes en plena carrera.</h3><p>Cuando menos lo esperas aparece una pregunta del sílabo. Responde a tiempo y sigue corriendo.</p><div className="q">¿Qué figura representa una DECISIÓN en un diagrama de flujo?<i>▮ Rombo</i><div className="bar"></div></div></div>
          <div className="bx s2 f2 rv d1"><span className="tg">TU PERSONAJE</span><h3>Hazlo tuyo.</h3><p>Piel, cabello, ropa y colores.</p><img src={imgAvatar} alt="Editor de personaje" /></div>
          <div className="bx s2 f3 rv"><span className="tg">RANKING</span><h3>Tabla de campeones.</h3><p>Compite con tus compañeros.</p><div className="rank"><div><span>1 · TÚ</span><span>0980</span></div><div><span>2 · ???</span><span>0870</span></div><div><span>3 · ???</span><span>0750</span></div></div></div>
          <div className="bx s2 f4 rv d1"><span className="tg">VIDAS Y REVIVE</span><h3>Una segunda oportunidad.</h3><p>Sin vidas, un reto de código te devuelve a la carrera.</p><span className="em">❤️‍🔥</span></div>
          <div className="bx s2 f2 rv d2"><span className="tg">POWER-UPS</span><h3>Puntos x2.</h3><p>Recoge la estrella y duplica tu puntaje 5 segundos.</p><span className="em">⭐</span></div>
        </div>
      </div></section>

      <section className="sec" id="como" style={{ background: 'var(--bg2)', borderTop: '1px solid var(--ln)', borderBottom: '1px solid var(--ln)', paddingLeft: 0, paddingRight: 0 }}>
        <span className="kick px rv">CÓMO FUNCIONA</span>
        <h2 className="rv">Cinco pasos.<br /><span className="gx">Cero complicaciones.</span></h2>
        <p className="lead rv d1">Desde entrar hasta responder tu primera pregunta sorpresa.</p>
        <div className="rail" ref={rail} onScroll={onScrollRail}>
          {PASOS.map((p, i) => (
            <article key={p.k} className={`card ${p.k}`}><small>PASO {i + 1}</small><h3>{p.titulo}</h3><p>{p.texto}</p><img src={p.img} alt={p.alt} /></article>
          ))}
        </div>
        <div className="ctl">
          <button className="ab" aria-label="Anterior" onClick={() => ver((cur + PASOS.length - 1) % PASOS.length)}>‹</button>
          <div className="dots">
            {PASOS.map((_, k) => (
              <button key={k === cur ? `on-${tick}` : k} className={k === cur ? 'ld-on' : ''} aria-label={`Paso ${k + 1}`} onClick={() => ver(k)} />
            ))}
          </div>
          <button className="ab" aria-label="Siguiente" onClick={() => ver((cur + 1) % PASOS.length)}>›</button>
        </div>
      </section>

      <section className="sec" id="zonas"><div className="in">
        <span className="kick px rv">CUATRO ZONAS</span>
        <h2 className="rv">Un viaje por<br /><span className="gy">todo el sílabo.</span></h2>
        <p className="lead rv d1">Cada zona trabaja una unidad. Al final, Lima Urbana mezcla todo.</p>
        <div className="zg">
          {ZONAS.map((z) => (
            <div key={z.nombre} className={`zc rv ${z.d}`.trim()} style={{ '--p': z.p }}><span className="em">{z.em}</span><small>{z.nivel}</small><h3>{z.nombre}</h3><p>{z.texto}</p></div>
          ))}
        </div>
      </div></section>

      <section className="sec" style={{ paddingTop: 0 }}><div className="in">
        <span className="kick px rv">DIFICULTAD</span>
        <h2 className="rv">Elige tu <span className="gx">reto.</span></h2>
        <p className="lead rv d1">Más dificultad, menos vidas, más gloria.</p>
        <div className="dg">
          {DIFICULTADES.map((x) => (
            <div key={x.nombre} className={`dc rv ${x.d}`.trim()}>
              <div className={`n ${x.g}`}>{x.n}</div><h3>{x.nombre}</h3><p>vidas</p><div className="hh">{x.hh}</div>
              <ul>{x.items.map((t) => <li key={t}>{t}</li>)}</ul>
            </div>
          ))}
        </div>
      </div></section>

      <section className="sec" id="docentes" style={{ background: 'var(--bg2)', borderTop: '1px solid var(--ln)', borderBottom: '1px solid var(--ln)' }}><div className="in teach">
        <div className="rv"><span className="kick px">PARA DOCENTES</span>
          <h2>Mira dónde <span className="gc">fallan tus alumnos.</span></h2>
          <ol className="tl"><li>Crea una sección y obtén tu link de invitación.</li><li>Compártelo: tus alumnos entran y juegan.</li><li>Revisa aciertos, errores por tema y mejor puntaje.</li></ol></div>
        <div className="panel rv d1"><div className="hd"><span>🧑‍🏫 PANEL DOCENTE</span><em>VISTA DE EJEMPLO</em></div>
          {ALUMNOS.map(([nombre, w, valor]) => (
            <div className="row" key={nombre}><span>{nombre}</span><i style={{ '--w': w }}></i><b>{valor}</b></div>
          ))}
        </div>
      </div></section>

      <section className="sec" id="faq"><div className="in">
        <span className="kick px rv">PREGUNTAS FRECUENTES</span>
        <h2 className="rv">Todo lo que <span className="gy">necesitas saber.</span></h2>
        <p className="lead rv d1">&nbsp;</p>
        <div className="faq rv">
          {FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
        </div>
      </div></section>

      <section className="fin" id="jugar">
        <span className="coin px">★ INSERT COIN ★</span>
        <h2 className="rv">¿Listo para <span className="gx">correr?</span></h2>
        <p className="lead rv d1" style={{ marginBottom: 38 }}>Elige tu zona y demuestra lo que sabes de PSeInt.</p>
        <button className="ld-btn" style={{ fontSize: 15, padding: '22px 34px' }} onClick={onJugar}>▶ Jugar ahora</button>
      </section>
      <footer>PSeInt Runner · Aprende pseudocódigo corriendo por el Perú.</footer>
    </div>
  );
}
