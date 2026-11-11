import { useEffect, useRef } from 'react';
import { useStore, defaultAvatar } from '../store/useStore';
import { drawPersonaje, AVATAR_REF } from '../game/spritePersonaje';
import '../styles/avatar.css';

const PIELES   = ['#F1C9A5','#F2C79A','#FDDBB4','#F0C48A','#C68642','#A0522D','#8B4513','#6B3A2A','#4A2811','#2C1810'];
const CABELLOS = ['#7B4028','#4F2A1E','#A8431F','#0A0A0A','#3B1F0A','#7B4A1E','#C8A45A','#C8601A','#8B8B8B','#D4D4D4'];
const ROPAS    = ['#1B1B22','#1F2A5C','#2563EB','#DC2626','#16A34A','#9333EA','#EA580C','#0891B2','#374151','#F59E0B'];

const PANTALONES = ['#1E6B73','#2A6AA0','#374151','#0A0A0A','#7B4A1E','#8B8B8B','#16A34A','#F59E0B'];

function SwatchRow({ colors, selected, onSelect }) {
  return (
    <div className="av-colors">
      {colors.map(c => (
        <div key={c} className={`color-swatch${c===selected?' sel':''}`}
          style={{ background: c }} onClick={() => onSelect(c)} title={c} />
      ))}
    </div>
  );
}

function BtnRow({ opts, selected, onSelect }) {
  return (
    <div className="av-btns">
      {opts.map(([val, label]) => (
        <button key={val} className={`av-btn${val===selected?' sel':''}`} onClick={() => onSelect(val)}>{label}</button>
      ))}
    </div>
  );
}

export default function EditorAvatar({ onDone }) {
  const { usuario, avatar, saveAvatar } = useStore();
  const av = avatar || defaultAvatar();
  const canvasRef = useRef(null);

  const update = (field, val) => saveAvatar({ ...av, [field]: val });

  useEffect(() => { dibujarPreview(canvasRef.current, av, usuario); }, [av, usuario]);

  return (
    <div className="avatar-bg">
      <div className="avatar-editor">
        <h2>🧑 CREA TU PERSONAJE</h2>
        <div className="av-preview">
          <canvas ref={canvasRef} width={120} height={160} style={{ imageRendering:'pixelated', border:'2px solid #1e4a6a', borderRadius:10, background:'#0a1628' }} />
        </div>
        <div className="av-section"><h3>Género</h3>
          <BtnRow opts={[['hombre','🧑 Hombre'],['mujer','👩 Mujer']]} selected={av.genero} onSelect={v=>update('genero',v)} />
        </div>
        <div className="av-section"><h3>Color de piel</h3>
          <SwatchRow colors={PIELES} selected={av.piel} onSelect={v=>update('piel',v)} />
        </div>
        <div className="av-section"><h3>Color de cabello</h3>
          <SwatchRow colors={CABELLOS} selected={av.cabello} onSelect={v=>update('cabello',v)} />
        </div>
        <div className="av-section"><h3>Ropa</h3>
          <BtnRow opts={[['polo','👕 Polo'],['buzo','🧥 Buzo'],['short','🩳 Short'],['pantalon','👖 Pantalón']]} selected={av.ropa} onSelect={v=>update('ropa',v)} />
        </div>
        <div className="av-section"><h3>Color de ropa</h3>
          <SwatchRow colors={ROPAS} selected={av.colorRopa} onSelect={v=>update('colorRopa',v)} />
        </div>
        <div className="av-section"><h3>Color de pantalón</h3>
          <SwatchRow colors={PANTALONES} selected={av.colorPantalon || AVATAR_REF.colorPantalon} onSelect={v=>update('colorPantalon',v)} />
        </div>
        <button className="av-btn" style={{marginTop:8}} onClick={() => saveAvatar({ ...AVATAR_REF, genero: av.genero })}>🎨 Restaurar diseño Joja</button>
        <button className="btn-main btn-cyan" style={{marginTop:12}} onClick={onDone}>✔ GUARDAR Y CONTINUAR</button>
      </div>
    </div>
  );
}

function dibujarPreview(c, av, nombre) {
  if (!c) return;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 120, 160);
  const cx = 60, groundY = 146;
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(cx, groundY, 24, 6, 0, 0, Math.PI * 2); ctx.fill();
  drawPersonaje(ctx, cx, groundY, av, { vista: 'frente', P: 4 });
  ctx.fillStyle = '#52dbf5'; ctx.font = '6px "Press Start 2P",monospace'; ctx.textAlign = 'center';
  ctx.fillText(nombre || 'JUGADOR', cx, 158);
}
