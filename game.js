"use strict";
// ============================================================
// Critter Survivor — motor do jogo (depende de data.js)
// ============================================================
const $ = (id) => document.getElementById(id);
const cv = $("c"), ctx = cv.getContext("2d");
let W = 0, H = 0, DPR = 1;
function resize() { DPR = Math.min(window.devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.imageSmoothingEnabled = true; }
addEventListener("resize", resize); resize();
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const dist2 = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
const TWO_PI = Math.PI * 2;

// ---------- persistência ----------
const KEY = "critter.save.v2";
let store = { owned: {}, sel: null, tickets: 3, gold: 0, pity: 0, best: 0, quizDone: false };
try { Object.assign(store, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} };

// ---------- áudio procedural ----------
let actx = null;
function beep(freq, dur = 0.06, type = "square", vol = 0.04) {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type; o.frequency.value = freq; g.gain.value = vol;
    g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur);
    o.connect(g); g.connect(actx.destination); o.start(); o.stop(actx.currentTime + dur);
  } catch (e) {}
}

// ---------- sprites ----------
const IMG = {};
const spriteUrl = (key) => `assets/animals/${key}.png`;
function loadImages() {
  const keys = new Set([...SPECIES.map((s) => s.spr), "a33", "a39", "a21", "a20"]);
  return Promise.all([...keys].map((k) => new Promise((res) => {
    const im = new Image(); im.onload = () => { IMG[k] = im; res(); }; im.onerror = () => res(); im.src = spriteUrl(k);
  })));
}
const tintCache = {};
function tinted(key, color, alpha = 0.5) {
  const ck = key + color; if (tintCache[ck]) return tintCache[ck];
  const im = IMG[key]; const c = document.createElement("canvas"); c.width = im.width; c.height = im.height;
  const x = c.getContext("2d"); x.drawImage(im, 0, 0); x.globalCompositeOperation = "source-atop"; x.globalAlpha = alpha; x.fillStyle = color; x.fillRect(0, 0, c.width, c.height);
  return (tintCache[ck] = c);
}
function drawSprite(src, x, y, h, flip, squash = 1) {
  const w = src.width * h / src.height;
  ctx.save(); ctx.translate(x, y); if (flip) ctx.scale(-1, 1);
  ctx.drawImage(src, -w / 2, -h * squash + h * 0.12, w, h * squash);
  ctx.restore();
}

// ---------- dados do jogo ----------
const ENEMIES = {
  grub:  { r: 9,  hp: 10,   spd: 55, dmg: 6,  xp: 1,  spr: "a33", color: "#8a3cff", size: 26 },
  bat:   { r: 8,  hp: 7,    spd: 95, dmg: 5,  xp: 1,  spr: "a39", color: "#ff3c5a", size: 24 },
  brute: { r: 15, hp: 60,   spd: 42, dmg: 14, xp: 5,  spr: "a21", color: "#222244", size: 44 },
  boss:  { r: 40, hp: 2600, spd: 52, dmg: 30, xp: 80, spr: "a20", color: "#ff1a4a", size: 130 },
};
const STATS = [
  { id: "dmg",  name: "Garras Afiadas", desc: "+20% de dano", apply: (p) => p.dmgMul *= 1.2 },
  { id: "spd",  name: "Patas Ligeiras", desc: "+10% de velocidade", apply: (p) => p.spd *= 1.1 },
  { id: "hp",   name: "Pelagem Grossa", desc: "+25 de vida máx. e cura 25", apply: (p) => { p.maxHp += 25; p.hp = Math.min(p.maxHp, p.hp + 25); } },
  { id: "rate", name: "Reflexos", desc: "-12% de recarga", apply: (p) => p.cdMul *= 0.88 },
  { id: "mag",  name: "Ímã", desc: "+40% de alcance de coleta", apply: (p) => p.magnet *= 1.4 },
  { id: "regen", name: "Regeneração", desc: "+0,6 de vida por segundo", apply: (p) => p.regen += 0.6 },
];
const MAX_SLOTS = 5, MAX_LV = 5;
const KIND_NAME = { proj: "Projétil", slash: "Corte", dash: "Investida", nova: "Onda", orbit: "Orbital", rain: "Chuva", boom: "Bumerangue", zone: "Zona", shield: "Defesa", heal: "Cura" };

// ---------- estado ----------
let S = null; // partida
const keys = {};
const joy = { on: false, id: -1, ox: 0, oy: 0, dx: 0, dy: 0 };
let curSp = null;

function mstat(m) {
  const b = MV[m.id], L = m.lv, p = S.p;
  const sc = 1 + 0.28 * (L - 1);
  return {
    dmg: (b.dmg || 0) * sc * p.dmgMul, cd: (b.cd || 1) * Math.pow(0.94, L - 1) * p.cdMul,
    n: (b.n || 1) + Math.floor((L - 1) / 2), R: (b.R || 0) * (1 + 0.06 * (L - 1)), r: (b.r || 0) * (1 + 0.06 * (L - 1)),
    dist: (b.dist || 0) * (1 + 0.05 * (L - 1)), dur: (b.dur || 0) * (1 + 0.08 * (L - 1)), amt: (b.amt || 0) * sc,
  };
}

function newGame(spId) {
  const sp = SPBY[spId]; curSp = sp;
  S = {
    t: 0, kills: 0, over: false, paused: false, cam: { x: 0, y: 0 }, spawnAcc: 0, bossSpawned: false,
    p: { x: 0, y: 0, r: Math.max(9, sp.size * 0.28), hp: sp.hp, maxHp: sp.hp, spd: sp.spd * 0.95, dmgMul: 1, cdMul: 1, magnet: 60, regen: 0,
         lv: 1, xp: 0, need: 5, face: 1, iframes: 0, shield: 0, dash: null, moves: [{ id: sp.moves[0], lv: 1, cd: 0.3, ang: 0 }], bob: 0 },
    en: [], pr: [], gem: [], fx: [], fl: [], zones: [], strikes: [],
  };
  hideAll(); $("stat").classList.remove("hidden"); $("slots").classList.remove("hidden"); refreshSlots();
}
function refreshSlots() {
  $("slots").innerHTML = S.p.moves.map((m) => `<span>${MV[m.id].name} <b>nv${m.lv}</b></span>`).join("");
}
function flash(text) { S.fl.push({ text, t: 2.2 }); }

// ---------- spawn ----------
function spawn(type) {
  const d = ENEMIES[type], a = rnd(0, TWO_PI), R = Math.hypot(W, H) / 2 + 40, scale = 1 + S.t / 240;
  S.en.push({ type, x: S.p.x + Math.cos(a) * R, y: S.p.y + Math.sin(a) * R, r: d.r, hp: d.hp * scale, maxHp: d.hp * scale, spd: d.spd * (1 + S.t / 900), dmg: d.dmg, xp: d.xp, hit: 0, stun: 0, slowT: 0, slowF: 1, dotT: 0, dps: 0, orbT: 0, bob: Math.random() * 6 });
}
function spawnTick(dt) {
  const t = S.t; S.spawnAcc += (0.9 + t / 28) * dt;
  while (S.spawnAcc >= 1) {
    S.spawnAcc -= 1; if (S.en.length > 240) continue;
    const r = Math.random(); spawn(t > 90 && r < 0.12 ? "brute" : t > 30 && r < 0.45 ? "bat" : "grub");
  }
  if (!S.bossSpawned && t >= 300) { S.bossSpawned = true; spawn("boss"); flash("O Colosso despertou!"); }
}

// ---------- dano ----------
function dmgEnemy(e, amt, kx, ky, o) {
  if (e.dead) return; o = o || {};
  e.hp -= amt; e.hit = 0.08;
  if (S.fx.length < 80) S.fx.push({ x: e.x, y: e.y - e.r, text: Math.round(amt), t: 0.5 });
  const boss = e.type === "boss";
  if (kx !== undefined && !boss) { e.x += kx * (o.knock || 3); e.y += ky * (o.knock || 3); }
  if (o.stun) e.stun = Math.max(e.stun, o.stun * (boss ? 0.3 : 1));
  if (o.slow) { e.slowT = 1.2; e.slowF = Math.min(e.slowF, boss ? 0.8 : o.slow); }
  if (o.dot) { e.dotT = 3; e.dps = Math.max(e.dps, o.dot * (1 + (S.p.dmgMul - 1))); }
  if (e.hp <= 0) {
    e.dead = true; S.kills++; S.gem.push({ x: e.x, y: e.y, v: e.xp });
    if (boss) endGame(true);
    beep(220 + Math.random() * 60, 0.04, "triangle", 0.03);
  }
}
function nearest(from, maxD2 = 1e9) {
  let best = null, bd = maxD2;
  for (const e of S.en) { if (e.dead) continue; const d = dist2(from, e); if (d < bd) { bd = d; best = e; } }
  return best;
}
const fxRing = (x, y, R, color = "255,236,120", max = 0.3) => S.fx.push({ ring: true, x, y, R, t: max, max, color });
function moveOpts(b) { return { knock: b.knock, stun: b.stun, slow: b.slow, dot: b.dot }; }

// ---------- motor de golpes ----------
function weaponTick(dt) {
  const p = S.p;
  for (const m of p.moves) {
    const b = MV[m.id], st = mstat(m); m.cd -= dt;
    const o = moveOpts(b);
    switch (b.kind) {
      case "proj": {
        if (m.cd > 0) break;
        const t = nearest(p, 420 * 420); if (!t) { m.cd = 0.1; break; }
        const base = Math.atan2(t.y - p.y, t.x - p.x), n = st.n, sp = b.spread || 0.18;
        for (let i = 0; i < n; i++) {
          const a = base + (n > 1 ? (i - (n - 1) / 2) * (sp * (b.spread ? 1 : 1)) : 0);
          S.pr.push({ x: p.x, y: p.y, vx: Math.cos(a) * b.spd, vy: Math.sin(a) * b.spd, dmg: st.dmg, life: b.life, pierce: (b.pierce || 1) + Math.floor((m.lv - 1) / 3), size: b.size || 6, home: b.home, hit: [], o });
        }
        beep(660, 0.04, "square", 0.02); m.cd = st.cd; break;
      }
      case "boom": {
        if (m.cd > 0) break;
        const t = nearest(p, 420 * 420); if (!t) { m.cd = 0.1; break; }
        const a = Math.atan2(t.y - p.y, t.x - p.x);
        for (let i = 0; i < st.n; i++) { const aa = a + (st.n > 1 ? (i - (st.n - 1) / 2) * 0.4 : 0); S.pr.push({ boom: true, x: p.x, y: p.y, vx: Math.cos(aa) * b.spd, vy: Math.sin(aa) * b.spd, dmg: st.dmg, life: b.life, t: 0, size: b.size || 8, hit: [], pierce: 99, o }); }
        m.cd = st.cd; break;
      }
      case "slash": {
        if (m.cd > 0) break;
        const t = nearest(p, (st.R + 70) ** 2); if (!t) { m.cd = 0.08; break; }
        const a = Math.atan2(t.y - p.y, t.x - p.x), arc = b.arc;
        for (const e of S.en) {
          if (e.dead) continue; const d = Math.hypot(e.x - p.x, e.y - p.y); if (d > st.R + e.r) continue;
          let da = Math.abs(((Math.atan2(e.y - p.y, e.x - p.x) - a + Math.PI * 3) % TWO_PI) - Math.PI);
          if (da <= arc / 2 + 0.2 || d < e.r + 12) dmgEnemy(e, st.dmg, Math.cos(a), Math.sin(a), o);
        }
        S.fx.push({ slash: true, x: p.x, y: p.y, ang: a, R: st.R, arc, t: 0.16, max: 0.16 });
        beep(300, 0.03, "triangle", 0.02); m.cd = st.cd; break;
      }
      case "dash": {
        if (m.cd > 0 || p.dash) break;
        const t = nearest(p, 320 * 320); if (!t) { m.cd = 0.15; break; }
        const a = Math.atan2(t.y - p.y, t.x - p.x);
        p.dash = { vx: Math.cos(a) * 640, vy: Math.sin(a) * 640, left: st.dist, dmg: st.dmg, hit: new Set(), o };
        p.iframes = Math.max(p.iframes, st.dist / 640 + 0.1); m.cd = st.cd; beep(200, 0.1, "sawtooth", 0.03); break;
      }
      case "nova": {
        if (m.cd > 0) break;
        if (!nearest(p, (st.R * 1.2) ** 2)) { m.cd = 0.15; break; }
        for (const e of S.en) if (!e.dead && dist2(p, e) < (st.R + e.r) ** 2) { const d = Math.hypot(e.x - p.x, e.y - p.y) || 1; dmgEnemy(e, st.dmg, (e.x - p.x) / d, (e.y - p.y) / d, o); }
        fxRing(p.x, p.y, st.R); beep(180, 0.1, "sawtooth", 0.025); m.cd = st.cd; break;
      }
      case "orbit": {
        m.ang += dt * 2.4; const R = (b.R || 50) * (1 + 0.04 * (m.lv - 1));
        for (let i = 0; i < st.n; i++) {
          const a = m.ang + (i / st.n) * TWO_PI, ox = p.x + Math.cos(a) * R, oy = p.y + Math.sin(a) * R;
          for (const e of S.en) {
            if (e.dead || e.orbT > 0) continue;
            if ((e.x - ox) ** 2 + (e.y - oy) ** 2 < (e.r + (b.size || 8)) ** 2) { dmgEnemy(e, st.dmg, Math.cos(a), Math.sin(a), o); e.orbT = 0.35; }
          }
        }
        break;
      }
      case "rain": {
        if (m.cd > 0) break;
        const cands = S.en.filter((e) => !e.dead && dist2(p, e) < b.range * b.range); if (!cands.length) { m.cd = 0.15; break; }
        for (let i = 0; i < st.n; i++) { const e = pick(cands); S.strikes.push({ x: e.x + rnd(-8, 8), y: e.y + rnd(-8, 8), r: st.r, t: 0.35, dmg: st.dmg, o }); }
        m.cd = st.cd; break;
      }
      case "zone": {
        if (m.cd > 0) break;
        if (!nearest(p, 300 * 300)) { m.cd = 0.2; break; }
        S.zones.push({ x: p.x, y: p.y, r: st.r, t: b.dur ? st.dur : 4, dmg: st.dmg, slow: b.slow, dot: b.dot, tick: 0 });
        if (S.zones.length > 8) S.zones.shift(); m.cd = st.cd; break;
      }
      case "shield": {
        if (m.cd > 0) break; if (!nearest(p, 260 * 260)) { m.cd = 0.3; break; }
        p.shield = st.dur; p.iframes = Math.max(p.iframes, st.dur); m.cd = st.cd + st.dur; beep(500, 0.12, "sine", 0.03); break;
      }
      case "heal": {
        if (m.cd > 0) break; if (p.hp >= p.maxHp) { m.cd = 0.5; break; }
        p.hp = Math.min(p.maxHp, p.hp + st.amt); S.fx.push({ x: p.x, y: p.y - 16, text: "+" + Math.round(st.amt), t: 0.6, good: true }); m.cd = st.cd; beep(900, 0.1, "sine", 0.03); break;
      }
    }
  }
}

// ---------- level up ----------
function xpGain(v) {
  const p = S.p; p.xp += v;
  while (p.xp >= p.need) { p.xp -= p.need; p.lv++; p.need = Math.round(5 + p.lv * 3.2 + p.lv ** 1.4); openLevelUp(); }
}
function openLevelUp() {
  S.paused = true;
  const p = S.p, opts = [];
  for (const m of p.moves) if (m.lv < MAX_LV) opts.push({ t: "up", m, title: `Evoluir ${MV[m.id].name}`, desc: `nv.${m.lv} → nv.${m.lv + 1}: mais dano, mais rápido. ${MV[m.id].desc}` });
  if (p.moves.length < MAX_SLOTS) for (const id of curSp.moves) if (!p.moves.some((m) => m.id === id)) opts.push({ t: "learn", id, title: `Aprender ${MV[id].name}`, desc: `[${KIND_NAME[MV[id].kind]}] ${MV[id].desc}` });
  for (const s of STATS) opts.push({ t: "stat", s, title: s.name, desc: s.desc });
  const picks = [];
  const pool = opts.slice(); while (picks.length < 3 && pool.length) picks.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  const box = $("picks"); box.innerHTML = "";
  for (const o of picks) {
    const b = document.createElement("button"); b.className = "pick"; b.innerHTML = `<b>${o.title}</b><small>${o.desc}</small>`;
    b.onclick = () => {
      if (o.t === "up") o.m.lv++; else if (o.t === "learn") p.moves.push({ id: o.id, lv: 1, cd: 0.3, ang: 0 }); else o.s.apply(p);
      $("levelup").classList.add("hidden"); S.paused = false; refreshSlots(); beep(880, 0.08, "triangle", 0.04);
    };
    box.appendChild(b);
  }
  $("levelup").classList.remove("hidden"); box.firstChild && box.firstChild.focus();
}

// ---------- fim de partida ----------
function endGame(win) {
  if (S.over) return; S.over = true;
  const secs = Math.floor(S.t), prev = store.best || 0;
  const score = S.kills * 10 + secs * 5 + (win ? 5000 : 0);
  if (score > prev) store.best = score;
  let tk = Math.floor(S.kills / 50) + Math.floor(secs / 120) + (win ? 5 : 0); if (secs >= 45) tk = Math.max(1, tk);
  store.tickets += tk; save();
  $("endTitle").textContent = win ? "Vitória!" : "Você caiu";
  $("endInfo").innerHTML = `${curSp.name} • Tempo ${fmt(secs)} • Kills ${S.kills} • Nível ${S.p.lv}<br><b>Pontos: ${score}</b>${score > prev ? " (novo recorde!)" : ` (recorde ${prev})`}<br><b style="color:#ffd84a">+${tk} ticket(s) de roleta</b>`;
  setTimeout(() => $("end").classList.remove("hidden"), 600);
}

// ---------- atualização ----------
function update(dt) {
  if (!S || S.paused || S.over) return;
  S.t += dt; const p = S.p;
  let ix = (keys.ArrowRight || keys.d || keys.D ? 1 : 0) - (keys.ArrowLeft || keys.a || keys.A ? 1 : 0);
  let iy = (keys.ArrowDown || keys.s || keys.S ? 1 : 0) - (keys.ArrowUp || keys.w || keys.W ? 1 : 0);
  if (joy.on) { ix = joy.dx; iy = joy.dy; }
  const mg = Math.hypot(ix, iy); if (mg > 1) { ix /= mg; iy /= mg; }
  if (p.dash) {
    const d = p.dash, step = 640 * dt; p.x += d.vx * dt; p.y += d.vy * dt; d.left -= step;
    for (const e of S.en) if (!e.dead && !d.hit.has(e) && (e.x - p.x) ** 2 + (e.y - p.y) ** 2 < (e.r + p.r + 8) ** 2) { d.hit.add(e); dmgEnemy(e, d.dmg, d.vx / 640, d.vy / 640, d.o); }
    S.fx.push({ x: p.x, y: p.y, trail: true, t: 0.25, max: 0.25, size: curSp.size });
    if (d.left <= 0) p.dash = null;
  } else { p.x += ix * p.spd * dt; p.y += iy * p.spd * dt; }
  if (ix) p.face = ix > 0 ? 1 : -1;
  p.bob += dt * ((ix || iy) ? 12 : 3);
  p.hp = Math.min(p.maxHp, p.hp + p.regen * dt); p.iframes -= dt; p.shield -= dt;
  spawnTick(dt); weaponTick(dt);
  // projéteis
  for (const b of S.pr) {
    if (b.boom) { b.t += dt; if (b.t > b.life / 2) { const dx = p.x - b.x, dy = p.y - b.y, d = Math.hypot(dx, dy) || 1, sp = Math.hypot(b.vx, b.vy) || 260; b.vx = dx / d * sp; b.vy = dy / d * sp; if (!b.turned) { b.turned = true; b.hit = []; } if (d < 14) b.life = 0; } }
    else if (b.home) { const t = nearest(b, 400 * 400); if (t) { const dx = t.x - b.x, dy = t.y - b.y, d = Math.hypot(dx, dy) || 1, sp = Math.hypot(b.vx, b.vy); b.vx += (dx / d * sp - b.vx) * Math.min(1, dt * 6); b.vy += (dy / d * sp - b.vy) * Math.min(1, dt * 6); } }
    b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
    for (const e of S.en) {
      if (e.dead || b.life <= 0 || b.hit.includes(e)) continue;
      if ((e.x - b.x) ** 2 + (e.y - b.y) ** 2 < (e.r + b.size) ** 2) { b.hit.push(e); const sp = Math.hypot(b.vx, b.vy) || 1; dmgEnemy(e, b.dmg, b.vx / sp, b.vy / sp, b.o); if (!b.boom && --b.pierce <= 0) b.life = 0; }
    }
  }
  // golpes em área agendados
  for (const s of S.strikes) {
    s.t -= dt;
    if (s.t <= 0) { for (const e of S.en) if (!e.dead && (e.x - s.x) ** 2 + (e.y - s.y) ** 2 < (s.r + e.r) ** 2) dmgEnemy(e, s.dmg, 0, 0, s.o); fxRing(s.x, s.y, s.r + 6, "255,160,90", 0.25); }
  }
  S.strikes = S.strikes.filter((s) => s.t > 0);
  // zonas
  for (const z of S.zones) {
    z.t -= dt; z.tick -= dt;
    const tickNow = z.tick <= 0; if (tickNow) z.tick = 0.5;
    for (const e of S.en) if (!e.dead && (e.x - z.x) ** 2 + (e.y - z.y) ** 2 < (z.r + e.r) ** 2) {
      if (z.slow) { e.slowT = 0.5; e.slowF = Math.min(e.slowF, z.slow); }
      if (tickNow) dmgEnemy(e, z.dmg, undefined, undefined, { dot: z.dot });
    }
  }
  S.zones = S.zones.filter((z) => z.t > 0);
  // inimigos
  for (const e of S.en) {
    if (e.dead) continue;
    e.hit -= dt; e.orbT -= dt; e.stun -= dt; e.slowT -= dt; if (e.slowT <= 0) e.slowF = 1; e.bob += dt * 8;
    if (e.dotT > 0) { e.dotT -= dt; e.hp -= e.dps * dt; if (e.hp <= 0 && !e.dead) { e.dead = true; S.kills++; S.gem.push({ x: e.x, y: e.y, v: e.xp }); if (e.type === "boss") endGame(true); } }
    if (e.dead) continue;
    const dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy) || 1;
    if (e.stun <= 0) { const sp = e.spd * (e.slowT > 0 ? e.slowF : 1); e.x += dx / d * sp * dt; e.y += dy / d * sp * dt; }
    if (d < e.r + p.r && p.iframes <= 0) {
      p.hp -= e.dmg; p.iframes = 0.5; beep(110, 0.12, "sawtooth", 0.05);
      S.fx.push({ x: p.x, y: p.y - 14, text: "-" + e.dmg, t: 0.5, bad: true }); if (p.hp <= 0) endGame(false);
    }
  }
  for (let i = 0; i < S.en.length; i += 2) { // separação barata
    const a = S.en[i], b = S.en[(i * 7 + 3) % S.en.length]; if (!b || a === b) continue;
    const dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy), min = a.r + b.r;
    if (d > 0 && d < min) { const k = (min - d) / 2 / d; a.x += dx * k; a.y += dy * k; b.x -= dx * k; b.y -= dy * k; }
  }
  // gemas
  for (const g of S.gem) {
    const d = Math.hypot(p.x - g.x, p.y - g.y);
    if (d < p.magnet) { g.x += (p.x - g.x) / d * 260 * dt; g.y += (p.y - g.y) / d * 260 * dt; }
    if (d < p.r + 6) { g.taken = true; xpGain(g.v); beep(1200, 0.03, "sine", 0.02); }
  }
  S.en = S.en.filter((e) => !e.dead); S.pr = S.pr.filter((b) => b.life > 0); S.gem = S.gem.filter((g) => !g.taken);
  for (const f of S.fx) f.t -= dt; S.fx = S.fx.filter((f) => f.t > 0);
  for (const f of S.fl) f.t -= dt; S.fl = S.fl.filter((f) => f.t > 0);
  if (S.t >= 600 && !S.over) endGame(true);
  S.cam.x += (p.x - S.cam.x) * Math.min(1, dt * 8); S.cam.y += (p.y - S.cam.y) * Math.min(1, dt * 8);
  $("sLv").textContent = `Nv ${p.lv}`; $("sTime").textContent = fmt(Math.floor(S.t)); $("sKills").textContent = `☠ ${S.kills}`;
}

// ---------- desenho ----------
function draw() {
  ctx.fillStyle = "#101a3a"; ctx.fillRect(0, 0, W, H);
  if (!S) return;
  const cx = S.cam.x - W / 2, cy = S.cam.y - H / 2, g = 64;
  ctx.strokeStyle = "rgba(255,255,255,.05)"; ctx.lineWidth = 1; ctx.beginPath();
  for (let x = -((cx % g) + g) % g; x < W; x += g) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
  for (let y = -((cy % g) + g) % g; y < H; y += g) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
  ctx.stroke();
  ctx.save(); ctx.translate(-cx, -cy);
  for (const z of S.zones) { ctx.fillStyle = "rgba(120,255,160,.14)"; ctx.strokeStyle = "rgba(120,255,160,.5)"; ctx.beginPath(); ctx.arc(z.x, z.y, z.r, 0, TWO_PI); ctx.fill(); ctx.stroke(); }
  for (const s of S.strikes) { ctx.strokeStyle = `rgba(255,120,80,${0.4 + 0.6 * (1 - s.t / 0.35)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, TWO_PI); ctx.stroke(); }
  for (const g2 of S.gem) { ctx.fillStyle = "#6cf0ff"; ctx.beginPath(); ctx.moveTo(g2.x, g2.y - 5); ctx.lineTo(g2.x + 4, g2.y); ctx.lineTo(g2.x, g2.y + 5); ctx.lineTo(g2.x - 4, g2.y); ctx.fill(); }
  const p = S.p;
  for (const e of S.en) {
    const d = ENEMIES[e.type];
    ctx.fillStyle = "rgba(0,0,0,.28)"; ctx.beginPath(); ctx.ellipse(e.x, e.y + e.r * 0.7, e.r * 0.9, e.r * 0.3, 0, 0, TWO_PI); ctx.fill();
    const src = e.hit > 0 ? tinted(d.spr, "#ffffff", 0.85) : tinted(d.spr, d.color, 0.5);
    drawSprite(src, e.x, e.y + e.r * 0.7 + Math.sin(e.bob) * 1.5, d.size, e.x > p.x);
    if (e.type === "boss" || e.type === "brute") { ctx.fillStyle = "#000a"; ctx.fillRect(e.x - e.r, e.y - d.size - 4, e.r * 2, 4); ctx.fillStyle = "#ff4a6a"; ctx.fillRect(e.x - e.r, e.y - d.size - 4, e.r * 2 * clamp(e.hp / e.maxHp, 0, 1), 4); }
    if (e.stun > 0) { ctx.fillStyle = "#fff"; ctx.font = "10px system-ui"; ctx.textAlign = "center"; ctx.fillText("✦", e.x, e.y - d.size - 6); }
  }
  // trilhas de investida
  for (const f of S.fx) if (f.trail) { ctx.globalAlpha = (f.t / f.max) * 0.4; drawSprite(IMG[curSp.spr], f.x, f.y + p.r * 0.7, f.size, p.face < 0); ctx.globalAlpha = 1; }
  // jogador
  const hurt = p.iframes > 0 && p.shield <= 0 && Math.floor(S.t * 20) % 2;
  ctx.fillStyle = "rgba(0,0,0,.3)"; ctx.beginPath(); ctx.ellipse(p.x, p.y + p.r * 0.7, p.r * 1.1, p.r * 0.4, 0, 0, TWO_PI); ctx.fill();
  ctx.globalAlpha = hurt ? 0.4 : 1; drawSprite(IMG[curSp.spr], p.x, p.y + p.r * 0.7 - Math.abs(Math.sin(p.bob)) * 3, curSp.size, p.face < 0, 1 - Math.abs(Math.sin(p.bob)) * 0.04); ctx.globalAlpha = 1;
  if (p.shield > 0) { ctx.strokeStyle = "rgba(120,200,255,.8)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p.x, p.y, p.r + 12, 0, TWO_PI); ctx.stroke(); }
  // orbitais
  for (const m of p.moves) if (MV[m.id].kind === "orbit") { const st = mstat(m), R = (MV[m.id].R || 50) * (1 + 0.04 * (m.lv - 1)); for (let i = 0; i < st.n; i++) { const a = m.ang + (i / st.n) * TWO_PI; ctx.fillStyle = "#c8ff9a"; ctx.beginPath(); ctx.arc(p.x + Math.cos(a) * R, p.y + Math.sin(a) * R, MV[m.id].size || 8, 0, TWO_PI); ctx.fill(); ctx.strokeStyle = "#4a7a2a"; ctx.lineWidth = 2; ctx.stroke(); } }
  for (const b of S.pr) { ctx.fillStyle = b.boom ? "#ffcf6a" : "#fff1a8"; ctx.beginPath(); ctx.arc(b.x, b.y, b.size, 0, TWO_PI); ctx.fill(); ctx.strokeStyle = "#b0782a"; ctx.lineWidth = 1.5; ctx.stroke(); }
  for (const f of S.fx) {
    if (f.ring) { ctx.strokeStyle = `rgba(${f.color},${f.t / f.max})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(f.x, f.y, f.R * (1 - (f.t / f.max) * 0.2), 0, TWO_PI); ctx.stroke(); continue; }
    if (f.slash) { ctx.strokeStyle = `rgba(255,255,255,${f.t / f.max})`; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(f.x, f.y, f.R * 0.8, f.ang - f.arc / 2, f.ang + f.arc / 2); ctx.stroke(); continue; }
    if (f.trail) continue;
    ctx.fillStyle = f.bad ? "#ff6a7a" : f.good ? "#7dffa0" : "#fff"; ctx.font = "bold 12px system-ui"; ctx.textAlign = "center"; ctx.fillText(f.text, f.x, f.y - (0.5 - f.t) * 30);
  }
  ctx.restore();
  const bw = Math.min(360, W - 24), bx = (W - bw) / 2;
  ctx.fillStyle = "#000a"; ctx.fillRect(bx, H - 28, bw, 10); ctx.fillStyle = "#ff5470"; ctx.fillRect(bx, H - 28, bw * clamp(p.hp / p.maxHp, 0, 1), 10);
  ctx.fillStyle = "#000a"; ctx.fillRect(bx, H - 14, bw, 6); ctx.fillStyle = "#6cf0ff"; ctx.fillRect(bx, H - 14, bw * (p.xp / p.need), 6);
  ctx.textAlign = "center";
  for (const f of S.fl) { ctx.globalAlpha = Math.min(1, f.t); ctx.fillStyle = "#ffd84a"; ctx.font = "bold 26px system-ui"; ctx.fillText(f.text, W / 2, H * 0.28); ctx.globalAlpha = 1; }
  if (joy.on) { ctx.strokeStyle = "#fff6"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(joy.ox, joy.oy, 44, 0, TWO_PI); ctx.stroke(); ctx.fillStyle = "#fff5"; ctx.beginPath(); ctx.arc(joy.ox + joy.dx * 44, joy.oy + joy.dy * 44, 18, 0, TWO_PI); ctx.fill(); }
}

let last = performance.now();
function frame(now) { const dt = Math.min(0.05, (now - last) / 1000); last = now; update(dt); draw(); requestAnimationFrame(frame); }

// ---------- entrada ----------
addEventListener("keydown", (e) => { keys[e.key] = true; if (e.key.startsWith("Arrow") && S && !S.over) e.preventDefault(); });
addEventListener("keyup", (e) => { keys[e.key] = false; });
cv.addEventListener("pointerdown", (e) => { if (joy.on) return; joy.on = true; joy.id = e.pointerId; joy.ox = e.clientX; joy.oy = e.clientY; joy.dx = joy.dy = 0; cv.setPointerCapture(e.pointerId); });
cv.addEventListener("pointermove", (e) => { if (!joy.on || e.pointerId !== joy.id) return; const dx = e.clientX - joy.ox, dy = e.clientY - joy.oy, d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 44); joy.dx = dx / d * k; joy.dy = dy / d * k; });
const up = (e) => { if (e.pointerId === joy.id) { joy.on = false; joy.dx = joy.dy = 0; } };
cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);

// ============================================================
// TELAS: menu, quiz, coleção, roleta
// ============================================================
const SCREENS = ["menu", "quiz", "reveal", "coll", "roul", "levelup", "end"];
function hideAll() { for (const s of SCREENS) $(s).classList.add("hidden"); $("stat").classList.add("hidden"); $("slots").classList.add("hidden"); $("modal").classList.add("hidden"); }
function show(id) { hideAll(); $(id).classList.remove("hidden"); }
const tier = (s) => TIERS[s.tier];
const imgTag = (s, cls) => `<img src="${spriteUrl(s.spr)}" ${cls ? `class="${cls}"` : ""} alt="${s.name}">`;
const movesHtml = (s) => `<ul class="moves">${s.moves.map((id, i) => `<li><b>${MV[id].name}</b>${i === 0 ? ' <span class="tag">inicial</span>' : ""}${MV[id].sig ? ' <span class="tag">único</span>' : ""} <span class="tag">${KIND_NAME[MV[id].kind]}</span><small>${MV[id].desc}</small></li>`).join("")}</ul>`;
function own(id) { const dup = store.owned[id] > 0; store.owned[id] = (store.owned[id] || 0) + 1; return !dup; }

// ---------- menu ----------
function showMenu() {
  S = null; show("menu");
  $("chipFree").textContent = `🎟 ${store.tickets}`; $("chipGold").textContent = `⭐ ${store.gold}`; $("chipBest").textContent = store.best ? `Recorde ${store.best}` : "Sem recorde";
  const s = SPBY[store.sel];
  $("menuSel").innerHTML = s ? `${imgTag(s, "big")}<div><b style="color:${tier(s).color}">${s.name}</b> <span class="tag">${CLASS[s.cls].name}</span> <span class="tag" style="color:${tier(s).color}">${tier(s).name}</span></div>` : "";
}
$("bPlay").onclick = () => { if (store.sel) newGame(store.sel); };
$("bColl").onclick = showColl;
$("bRoul").onclick = showRoul;
$("bQuiz").onclick = startQuiz;
$("again").onclick = () => newGame(curSp.id);
$("toMenu").onclick = showMenu;

// ---------- quiz ----------
let qi = 0, qvec = [0, 0, 0, 0, 0, 0];
function startQuiz() { qi = 0; qvec = [0, 0, 0, 0, 0, 0]; show("quiz"); renderQ(); }
function renderQ() {
  const q = QUIZ[qi]; $("qProg").textContent = `Pergunta ${qi + 1} de ${QUIZ.length}`; $("qText").textContent = q.q;
  const box = $("qOpts"); box.innerHTML = "";
  q.a.forEach(([text, vec]) => {
    const b = document.createElement("button"); b.className = "pick"; b.textContent = text;
    b.onclick = () => { vec.forEach((v, i) => qvec[i] += v); qi++; if (qi >= QUIZ.length) finishQuiz(); else renderQ(); };
    box.appendChild(b);
  });
}
function finishQuiz() {
  const starters = SPECIES.filter((s) => s.starter);
  let best = null, bs = -1e9;
  for (const s of starters) {
    const sc = s.traits.reduce((a, t, i) => a + t * qvec[i], 0) - Math.abs(s.traits.reduce((a, t) => a + t, 0) - qvec.reduce((a, t) => a + t, 0) / 3) * 0.5 + Math.random() * 1.5;
    if (sc > bs) { bs = sc; best = s; }
  }
  const top = qvec.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]).slice(0, 2).map((x) => TRAITS[x[1]].toLowerCase());
  own(best.id); store.sel = best.id; store.quizDone = true; save();
  reveal(best, "Seu animal inicial é...", `Suas respostas mostram um perfil de ${top[0]} e ${top[1]}. ${best.name} combina com você!`, showMenu);
}
function reveal(s, title, why, then) {
  show("reveal"); $("rvTitle").textContent = title; $("rvImg").src = spriteUrl(s.spr); $("rvName").textContent = s.name; $("rvName").style.color = tier(s).color;
  $("rvWhy").textContent = why; $("rvMoves").innerHTML = `<b>${CLASS[s.cls].name} • ${s.moves.length} golpes próprios</b>` + movesHtml(s); $("rvOk").onclick = then;
}

// ---------- coleção ----------
function showColl() {
  show("coll");
  const owned = SPECIES.filter((s) => store.owned[s.id] > 0).length; $("collCount").textContent = `${owned}/${SPECIES.length}`;
  const g = $("collGrid"); g.innerHTML = ""; $("collDetail").classList.add("hidden");
  [...SPECIES].sort((a, b) => a.tier - b.tier).forEach((s) => {
    const has = store.owned[s.id] > 0, c = document.createElement("div");
    c.className = "cell" + (has ? "" : " locked") + (store.sel === s.id ? " sel" : ""); c.style.borderColor = has ? tier(s).color : "";
    c.innerHTML = `${imgTag(s)}<b>${has ? s.name : "???"}</b><small style="color:${tier(s).color}">${tier(s).name}</small>${has && store.owned[s.id] > 1 ? `<small>×${store.owned[s.id]}</small>` : ""}`;
    c.onclick = () => showDetail(s, has); g.appendChild(c);
  });
}
function showDetail(s, has) {
  const d = $("collDetail"); d.classList.remove("hidden");
  d.innerHTML = `${imgTag(s)}<b style="font-size:18px;color:${tier(s).color}">${has ? s.name : "Animal bloqueado"}</b><br><small>${CLASS[s.cls].name} • ${tier(s).name} • vida ${s.hp} • vel. ${s.spd}</small><br>` +
    (has ? `<button id="useIt">Usar este animal</button>` : `<small>${s.tier === 4 ? "Exótico: só sai no ticket dourado (ou 0,4% no ticket do jogo)." : "Obtenha na roleta."}</small>`) + (has ? movesHtml(s) : "");
  if (has) $("useIt").onclick = () => { store.sel = s.id; save(); showColl(); };
  d.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
$("collBack").onclick = showMenu;

// ---------- roleta ----------
let spinning = false, wheelAng = 0, wheelSegs = [];
function roulHud() { $("rFree").textContent = `🎟 ${store.tickets}`; $("rGold").textContent = `⭐ ${store.gold} (pity ${store.pity}/${GOLD_PITY})`; $("spin1").disabled = spinning || store.tickets < 1; $("spin10").disabled = spinning || store.tickets < 10; $("gspin1").disabled = spinning || store.gold < 1; $("gspin10").disabled = spinning || store.gold < 10; }
function showRoul() {
  show("roul"); roulHud();
  $("rRates").innerHTML = `Ticket comum: ${TIERS.map((t, i) => `${t.name} ${RATES.free[i]}%`).join(" • ")}<br>Ticket dourado: ${TIERS.map((t, i) => RATES.gold[i] ? `${t.name} ${RATES.gold[i]}%` : "").filter(Boolean).join(" • ")} • exótico garantido a cada ${GOLD_PITY} giros<br>Duplicatas devolvem tickets. Ganhe tickets jogando partidas.`;
  buildWheel(null); drawWheel();
}
function pickTier(table) { let r = Math.random() * table.reduce((a, b) => a + b, 0); for (let i = 0; i < table.length; i++) { r -= table[i]; if (r <= 0) return i; } return table.length - 1; }
function pull(gold) {
  let t;
  if (gold) { store.pity++; if (store.pity >= GOLD_PITY) { t = 4; } else t = pickTier(RATES.gold); if (t === 4) store.pity = 0; }
  else t = pickTier(RATES.free);
  const s = pick(SPECIES.filter((x) => x.tier === t)); const isNew = own(s.id);
  let refund = "";
  if (!isNew) { if (t === 4) { store.gold += 1; refund = "+1 ⭐"; } else { store.tickets += TIERS[t].refund; refund = `+${TIERS[t].refund} 🎟`; } }
  return { s, isNew, refund };
}
function buildWheel(winner) {
  wheelSegs = []; const n = 8; for (let i = 0; i < n; i++) wheelSegs.push(pick(SPECIES.filter((s) => s.tier <= 3 && s.tier >= 0)));
  if (winner) wheelSegs[0] = winner;
}
function drawWheel() {
  const c = $("wheel"), x = c.getContext("2d"), R = 164, n = wheelSegs.length || 8; x.clearRect(0, 0, 340, 340); x.save(); x.translate(170, 170); x.rotate(wheelAng);
  const cols = ["#1c2a55", "#2a3b7a"];
  for (let i = 0; i < n; i++) {
    const a0 = i * TWO_PI / n - Math.PI / 2 - Math.PI / n, a1 = a0 + TWO_PI / n;
    x.beginPath(); x.moveTo(0, 0); x.arc(0, 0, R, a0, a1); x.closePath(); x.fillStyle = cols[i % 2]; x.fill(); x.strokeStyle = "#ffd84a"; x.lineWidth = 2; x.stroke();
    const s = wheelSegs[i]; if (s && IMG[s.spr]) { const am = (a0 + a1) / 2; x.save(); x.rotate(am + Math.PI / 2); const im = IMG[s.spr], h = 58, w = im.width * h / im.height; x.drawImage(im, -w / 2, -R + 16, w, h); x.restore(); }
  }
  x.beginPath(); x.arc(0, 0, 22, 0, TWO_PI); x.fillStyle = "#ffd84a"; x.fill(); x.restore();
}
function spin(gold, count) {
  if (spinning) return; if (gold ? store.gold < count : store.tickets < count) return;
  if (gold) store.gold -= count; else store.tickets -= count;
  const results = []; for (let i = 0; i < count; i++) results.push(pull(gold)); save();
  const best = results.reduce((a, b) => (b.s.tier > a.s.tier ? b : a)); buildWheel(best.s);
  spinning = true; roulHud();
  const start = wheelAng, turns = 5 + Math.floor(Math.random() * 3), target = start + turns * TWO_PI - (start % TWO_PI), t0 = performance.now(), dur = 3600;
  (function anim(now) {
    const k = clamp((now - t0) / dur, 0, 1), e = 1 - Math.pow(1 - k, 3);
    wheelAng = start + (target - start) * e; drawWheel(); beep(300 + 500 * (1 - k), 0.02, "square", 0.01);
    if (k < 1) requestAnimationFrame(anim); else { spinning = false; roulHud(); showResults(results, gold); }
  })(t0);
}
function showResults(results, gold) {
  const m = $("modal"), c = $("mcard"); m.classList.remove("hidden");
  const top = results.reduce((a, b) => (b.s.tier > a.s.tier ? b : a));
  c.innerHTML = `<h2>${results.length > 1 ? "Resultados" : "Você tirou!"}</h2>` + (results.length === 1 ? `${imgTag(top.s, "big")}<h1 style="font-size:24px;color:${tier(top.s).color}">${top.s.name}</h1><p>${tier(top.s).name} • ${CLASS[top.s.cls].name}${top.isNew ? " • <b style=color:#7dffa0>NOVO!</b>" : ` • repetido ${top.refund}`}</p>` : `<div class="res">${results.map((r) => `<div class="cell" style="border-color:${tier(r.s).color}">${imgTag(r.s)}<b>${r.s.name}</b><small style="color:${tier(r.s).color}">${tier(r.s).name}</small><small>${r.isNew ? "NOVO!" : r.refund}</small></div>`).join("")}</div>`) +
    `<button id="mOk">OK</button>`;
  $("mOk").onclick = () => { m.classList.add("hidden"); roulHud(); };
}
$("spin1").onclick = () => spin(false, 1); $("spin10").onclick = () => spin(false, 10); $("gspin1").onclick = () => spin(true, 1); $("gspin10").onclick = () => spin(true, 10);
$("rBack").onclick = showMenu;
$("bBuy").onclick = () => {
  const m = $("modal"), c = $("mcard"); m.classList.remove("hidden");
  c.innerHTML = `<h2>Tickets dourados</h2><p>Sorteiam Raro, Épico ou <b style="color:#ffcb3d">Exótico</b> (tigre, leão, onça, pantera, leopardo-das-neves).</p>
    <p><b>Pagamento real ainda não está integrado.</b> Em produção, a compra seria feita por um provedor (ex.: Stripe, Mercado Pago, Google Play/App Store).</p>
    <button id="mTest" class="gold">Teste: ganhar 5 tickets dourados</button><p style="font-size:11px">(botão de teste — remover antes de lançar)</p><button id="mOk" class="ghost">Fechar</button>`;
  $("mTest").onclick = () => { store.gold += 5; save(); roulHud(); m.classList.add("hidden"); };
  $("mOk").onclick = () => m.classList.add("hidden");
};

// ---------- boot ----------
loadImages().then(() => {
  requestAnimationFrame(frame);
  const demo = new URLSearchParams(location.search).get("demo"); // atalho de teste: ?demo=tigre (não grava no save)
  if (demo && SPBY[demo]) { store = { owned: { [demo]: 1 }, sel: demo, tickets: 3, gold: 0, pity: 0, best: 0, quizDone: true }; newGame(demo);
    if (new URLSearchParams(location.search).get("all")) { S.p.moves = SPBY[demo].moves.map((id) => ({ id, lv: 3, cd: 0.3, ang: 0 })); S.p.hp = S.p.maxHp = 9999; refreshSlots(); }
    return; }
  if (!store.quizDone || !store.sel || !SPBY[store.sel]) startQuiz(); else showMenu();
});
window.__game = { get S() { return S; }, get store() { return store; }, newGame, SPECIES, MV, pull, showMenu, showColl, showRoul };
