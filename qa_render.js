// Standalone renderer that reuses the SAME drawing functions as index.html,
// so the PNG reflects exactly what the game draws. Used only for visual QA.
const { createCanvas } = require("@napi-rs/canvas");
const fs = require("fs");

const W = 420, H = 760;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext("2d");

const COLLA = { name: "Test", shirt: "#2f6f8f", shirtDark: "#255a74", faixa: "#15212a", skin: "#e9c19a", pants: "#f1ece0" };
const N = 6;
let levelH = 48;
let ANIM = 0; // animation clock (0 in static QA render)

function roundRect(x, y, w, h, r) {
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function quadLimb(ax, ay, aw, bx, by, bw, fill, stroke) {
  const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  ctx.beginPath();
  ctx.moveTo(ax + nx * aw, ay + ny * aw);
  ctx.lineTo(bx + nx * bw, by + ny * bw);
  ctx.lineTo(bx - nx * bw, by - ny * bw);
  ctx.lineTo(ax - nx * aw, ay - ny * aw);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = FIGLW; ctx.stroke(); }
}
let FIGLW = 1.4;

// ---- BEGIN copy of drawCasteller (keep in sync with index.html) ----
function drawCasteller(x, y, idx, isTop, aleta, alpha, climbing, part, opts) {
  part = part || 0; // 0=all, 1=body only, 2=head only
  opts = opts || {};
  const back = !!opts.back, crouch = !!opts.crouch, legsApart = !!opts.legsApart;
  const u = levelH;
  const L = u * (crouch ? 0.26 : 0.55), T = u * (crouch ? 0.42 : 0.45);
  const breath = Math.sin(ANIM * 1.8 + idx * 0.9) * u * 0.012;
  const hipY = -L, shoY = -(L + T) - breath;
  const sw = u * (isTop ? 0.155 : 0.185);
  const hw = u * 0.1;
  const spread = !!opts.spread, reach = (opts.reach || 0.34) * u;
  const fs = u * (legsApart ? 0.32 : (crouch ? 0.28 : (spread ? 0.24 : 0.185)));
  const R = u * 0.135;
  const headY = shoY - R * 1.02;
  const OUT = "#23303a";
  FIGLW = Math.max(1.7, u * 0.055);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.lineJoin = "round"; ctx.lineCap = "round";

  const hand = (hx, hy) => {
    ctx.fillStyle = COLLA.skin; ctx.strokeStyle = OUT; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.arc(hx, hy, u * 0.05, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  };
  const arm = (sx, sy, ex, ey, hx, hy) => {
    quadLimb(sx, sy, u * 0.062, ex, ey, u * 0.05, COLLA.shirt, OUT);
    quadLimb(ex, ey, u * 0.045, hx, hy, u * 0.038, COLLA.skin, OUT);
    hand(hx, hy);
  };

  if (part !== 2) {
    // soft contact shadow where the feet rest on the shoulders below
    ctx.fillStyle = "rgba(20,28,34,.18)";
    ctx.beginPath(); ctx.ellipse(0, u * 0.04, u * 0.32, u * 0.07, 0, 0, Math.PI * 2); ctx.fill();

    // --- legs (trousers) + shoes ---
    quadLimb(-fs, 0, u * 0.085, -hw, hipY, u * 0.092, COLLA.pants, OUT);
    quadLimb(fs, 0, u * 0.085, hw, hipY, u * 0.092, COLLA.pants, OUT);
    ctx.strokeStyle = "rgba(20,28,34,.12)"; ctx.lineWidth = u * 0.05;
    ctx.beginPath(); ctx.moveTo(-fs * 0.5, hipY + u * 0.05); ctx.lineTo(-hw * 0.2, -u * 0.02); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(fs * 0.5, hipY + u * 0.05); ctx.lineTo(hw * 0.2, -u * 0.02); ctx.stroke();
    ctx.fillStyle = "#39302a"; ctx.strokeStyle = OUT; ctx.lineWidth = FIGLW;
    ctx.beginPath(); ctx.ellipse(-fs, 1, u * 0.105, u * 0.052, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(fs, 1, u * 0.105, u * 0.052, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    // --- torso (shirt) with volume ---
    const torsoPath = () => {
      ctx.beginPath();
      ctx.moveTo(-hw, hipY + u * 0.04);
      ctx.lineTo(-sw, shoY + u * 0.06);
      ctx.quadraticCurveTo(-sw, shoY - u * 0.05, -sw * 0.5, shoY - u * 0.05);
      ctx.lineTo(sw * 0.5, shoY - u * 0.05);
      ctx.quadraticCurveTo(sw, shoY - u * 0.05, sw, shoY + u * 0.06);
      ctx.lineTo(hw, hipY + u * 0.04);
      ctx.closePath();
    };
    ctx.fillStyle = COLLA.shirt; ctx.strokeStyle = OUT; ctx.lineWidth = FIGLW;
    torsoPath(); ctx.fill(); ctx.stroke();
    ctx.save(); torsoPath(); ctx.clip();
    ctx.fillStyle = darken(COLLA.shirt, 0.84); ctx.fillRect(sw * 0.18, shoY - u * 0.1, sw, T + u * 0.2);
    ctx.fillStyle = "rgba(255,255,255,.14)"; ctx.fillRect(-sw, shoY - u * 0.1, sw * 0.5, T + u * 0.2);
    ctx.restore();

    // --- faixa ---
    ctx.fillStyle = COLLA.faixa;
    ctx.beginPath(); roundRect(-hw * 1.25, hipY - u * 0.04, hw * 2.5, u * 0.18, u * 0.03); ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,.35)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-hw, hipY + u * 0.04); ctx.lineTo(hw, hipY + u * 0.04); ctx.stroke();

    // --- arms ---
    if (crouch) {
      // hands resting on the knees, elbows out
      arm(-sw * 0.7, shoY + u * 0.06, -fs * 0.9, hipY - u * 0.02, -fs * 0.85, hipY + u * 0.08);
      arm(sw * 0.7, shoY + u * 0.06, fs * 0.9, hipY - u * 0.02, fs * 0.85, hipY + u * 0.08);
    } else if (aleta) {
      arm(sw * 0.7, shoY + u * 0.05, sw * 1.1, shoY - u * 0.12, sw * 1.32, shoY - u * 0.56);
      arm(-sw * 0.7, shoY + u * 0.05, -sw * 1.05, hipY - u * 0.08, -hw * 1.15, hipY + u * 0.02);
    } else if (climbing) {
      arm(-sw * 0.6, shoY + u * 0.05, -sw * 0.5, shoY - u * 0.2, -u * 0.07, shoY - u * 0.46);
      arm(sw * 0.6, shoY + u * 0.05, sw * 0.5, shoY - u * 0.2, u * 0.07, shoY - u * 0.46);
    } else if (spread) {
      // arms reach OUT to rest the hands on the next casteller's shoulders
      arm(-sw * 0.5, shoY + u * 0.04, -reach * 0.55, shoY + u * 0.02, -reach, shoY + u * 0.07);
      arm(sw * 0.5, shoY + u * 0.04, reach * 0.55, shoY + u * 0.02, reach, shoY + u * 0.07);
    } else {
      arm(-sw * 0.75, shoY + u * 0.05, -sw * 1.02, shoY - u * 0.04, -fs * 0.95, shoY - u * 0.22);
      arm(sw * 0.75, shoY + u * 0.05, sw * 1.02, shoY - u * 0.04, fs * 0.95, shoY - u * 0.22);
    }
  }

  if (part !== 1) {
    const helmet = !!opts.helmet;
    // --- neck + head (drawn in a later pass so legs never cover the face) ---
    ctx.fillStyle = COLLA.skin; ctx.strokeStyle = OUT; ctx.lineWidth = FIGLW;
    ctx.beginPath(); roundRect(-u * 0.05, shoY - u * 0.06, u * 0.1, u * 0.1, u * 0.03); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, headY, R * 0.92, R, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.ellipse(0, headY, R * 0.92, R, 0, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = "rgba(0,0,0,.08)"; ctx.fillRect(R * 0.25, headY - R, R, R * 2);
    if (!helmet) {
      ctx.fillStyle = "#33271c";
      ctx.beginPath(); ctx.ellipse(-R * 0.82, headY + R * 0.1, R * 0.3, R * 0.6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(R * 0.82, headY + R * 0.1, R * 0.3, R * 0.6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = COLLA.shirt; ctx.fillRect(-R, headY - R * 1.05, R * 2, R * 0.95);
      ctx.fillStyle = darken(COLLA.shirt, 0.78); ctx.fillRect(-R, headY - R * 0.12, R * 2, R * 0.06);
    }
    ctx.restore();
    if (helmet) {
      // black helmet covering the top of the head + chin strap
      ctx.fillStyle = "#1c1c1c"; ctx.strokeStyle = OUT; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.ellipse(0, headY - R * 0.18, R * 1.04, R * 0.92, 0, Math.PI, 0); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,.18)"; ctx.beginPath(); ctx.ellipse(-R * 0.35, headY - R * 0.45, R * 0.3, R * 0.18, -0.4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#1c1c1c"; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(-R * 0.9, headY - R * 0.1); ctx.lineTo(-R * 0.5, headY + R * 0.7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(R * 0.9, headY - R * 0.1); ctx.lineTo(R * 0.5, headY + R * 0.7); ctx.stroke();
      if (!back) {
        ctx.fillStyle = "#2a2018";
        ctx.beginPath(); ctx.arc(-R * 0.3, headY + R * 0.28, R * 0.09, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(R * 0.3, headY + R * 0.28, R * 0.09, 0, Math.PI * 2); ctx.fill();
      }
    } else if (back) {
      // seen from behind: mocador knot at the nape, hair, NO face
      ctx.fillStyle = "#33271c"; ctx.beginPath(); ctx.ellipse(0, headY + R * 0.15, R * 0.7, R * 0.78, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = COLLA.shirt; ctx.fillRect(-R, headY - R * 1.05, R * 2, R * 0.8);
      ctx.fillStyle = darken(COLLA.shirt, 0.7); ctx.beginPath(); ctx.arc(0, headY - R * 0.1, R * 0.22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = COLLA.skin; ctx.beginPath(); ctx.arc(0, headY + R * 0.7, R * 0.4, 0.15 * Math.PI, 0.85 * Math.PI); ctx.fill();
    } else {
      ctx.fillStyle = COLLA.shirt; ctx.strokeStyle = OUT; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(R * 0.86, headY - R * 0.25, R * 0.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#2a2018";
      ctx.beginPath(); ctx.arc(-R * 0.32, headY + R * 0.22, R * 0.1, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(R * 0.32, headY + R * 0.22, R * 0.1, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(120,75,55,.55)"; ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.moveTo(0, headY + R * 0.2); ctx.lineTo(-R * 0.06, headY + R * 0.42); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, headY + R * 0.5, R * 0.24, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    }
  }

  ctx.restore();
}
function darken(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * f), g = Math.round(((n >> 8) & 255) * f), b = Math.round((n & 255) * f);
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}
// The pinya (no folre): everyone faces the tower and looks DOWN, huddled around
// the base. We only see napes, hair and mocadors (NO faces), and each one's arms
// stretched forward toward the casteller in front (inward, toward the centre).
function pinyaPerson(x, ry, s, dir, kind) {
  const OUT = "#202a31";
  // back / shoulders (a bent-over hump), shaded
  const grd = ctx.createLinearGradient(x - s, 0, x + s, 0);
  grd.addColorStop(0, COLLA.shirtDark); grd.addColorStop(0.5, COLLA.shirt); grd.addColorStop(1, COLLA.shirtDark);
  ctx.fillStyle = grd; ctx.strokeStyle = OUT; ctx.lineWidth = 1.3;
  ctx.beginPath(); ctx.ellipse(x, ry + s * 0.45, s * 1.12, s * 0.98, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // arm reaching forward toward the centre
  ctx.strokeStyle = COLLA.shirtDark; ctx.lineWidth = s * 0.4; ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x + dir * s * 0.5, ry + s * 0.55);
  ctx.quadraticCurveTo(x + dir * s * 1.3, ry + s * 0.45, x + dir * s * 1.7, ry + s * 0.1);
  ctx.stroke();
  // head from behind/above, tilted toward centre — hair or mocador, NO face
  const hx = x + dir * s * 0.18, hy = ry - s * 0.45, hr = s * 0.64;
  ctx.fillStyle = kind === "moc" ? COLLA.shirt : "#3a2c20";
  ctx.strokeStyle = OUT; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(hx, hy, hr, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  if (kind === "moc") { // knot of the mocador at the nape
    ctx.fillStyle = darken(COLLA.shirt, 0.7);
    ctx.beginPath(); ctx.arc(hx - dir * hr * 0.6, hy + hr * 0.5, hr * 0.28, 0, Math.PI * 2); ctx.fill();
  }
  // nape (clatell) hint at the bottom of the head
  ctx.fillStyle = COLLA.skin;
  ctx.beginPath(); ctx.arc(hx, hy + hr * 0.62, hr * 0.42, 0.15 * Math.PI, 0.85 * Math.PI); ctx.fill();
}

function drawPinya(cx, gy, radius) {
  const OUT = "#202a31";
  // dense mound: back rows narrower & higher, front rows wider & lower
  const rows = [
    { dy: -48, hw: radius * 0.5, s: 7.5 },
    { dy: -35, hw: radius * 0.72, s: 8.5 },
    { dy: -20, hw: radius * 0.91, s: 9.5 },
    { dy: -3, hw: radius * 1.06, s: 10.5 },
  ];
  rows.forEach((row, ri) => {
    const ry = gy + row.dy, s = row.s, step = s * 1.3;
    const count = Math.floor((row.hw * 2) / step) + 1;
    const startX = cx - (count - 1) * step / 2 + (ri % 2) * step * 0.5;
    const xs = [];
    for (let i = 0; i < count; i++) xs.push(startX + i * step);
    xs.sort((a, b) => Math.abs(b - cx) - Math.abs(a - cx)); // outer first, centre on top
    for (const x of xs) {
      const dir = x <= cx ? 1 : -1;
      const moc = Math.round((x - startX) / step) % 2 === 0;
      // shoulders behind the head
      ctx.fillStyle = COLLA.shirtDark; ctx.strokeStyle = OUT; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.ellipse(x, ry + s * 0.75, s * 1.05, s * 0.82, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      // arm stretched forward toward the centre (front rows only, to avoid clutter)
      if (ri >= 2) {
        ctx.strokeStyle = COLLA.shirtDark; ctx.lineWidth = s * 0.42; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(x + dir * s * 0.45, ry + s * 0.8);
        ctx.quadraticCurveTo(x + dir * s * 1.2, ry + s * 0.8, x + dir * s * 1.5, ry + s * 1.05); ctx.stroke();
      }
      // head from behind/above (looking down) — hair or mocador, NO face
      const hr = s * 0.8, hy = ry;
      ctx.fillStyle = moc ? COLLA.shirt : "#3a2c20"; ctx.strokeStyle = OUT; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(x, hy, hr, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      if (moc) { ctx.fillStyle = darken(COLLA.shirt, 0.7); ctx.beginPath(); ctx.arc(x, hy + hr * 0.42, hr * 0.22, 0, Math.PI * 2); ctx.fill(); }
      else { ctx.strokeStyle = "#2a2018"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, hy - hr * 0.7); ctx.lineTo(x, hy + hr * 0.5); ctx.stroke(); }
      // nape (clatell) hint
      ctx.fillStyle = COLLA.skin;
      ctx.beginPath(); ctx.arc(x, hy + hr * 0.68, hr * 0.4, 0.15 * Math.PI, 0.85 * Math.PI); ctx.fill();
    }
  });
}
// ---- END copy ----

function render(placed, climbing, goingUp, prog, file) {
  // bg
  const grd = ctx.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, "#cfe3ee"); grd.addColorStop(1, "#e8eedf");
  ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);
  const groundY = H * 0.84;
  ctx.fillStyle = "#d8cfb8"; ctx.fillRect(0, groundY + 4, W, H);
  levelH = Math.min(48, (groundY - H * 0.12) / (N + 1));
  const pinyaTop = groundY - 40;
  const baseY = pinyaTop + levelH * 0.06;
  const cxBase = W / 2;
  const drawAt = (lvl, idx, isTop, aleta, climb, part) => {
    ctx.save();
    ctx.translate(cxBase, baseY - levelH * lvl);
    drawCasteller(0, 0, idx, isTop, aleta, 1, climb, part);
    ctx.restore();
  };
  if (climbing && goingUp) drawAt(placed * prog, placed, placed === N - 1, false, true, 0);
  for (let i = 0; i < placed; i++) drawAt(i, i, i === N - 1, i === N - 1, false, 1); // bodies
  for (let i = 0; i < placed; i++) drawAt(i, i, i === N - 1, i === N - 1, false, 2); // heads on top
  if (climbing && !goingUp) drawAt(placed * (1 - prog), placed, placed === N - 1, false, true, 0);
  drawPinya(cxBase, groundY, Math.min(W * 0.44, 230));
  fs.writeFileSync(file, canvas.toBuffer("image/png"));
  console.log("wrote", file);
}

render(6, false, true, 0, "/tmp/full.png");
render(3, true, true, 0.6, "/tmp/climb.png");

// wide-trunk castell composition (Phase 1 of the new engine)
function wideFloors(width, num) { const T = num - 4; const f = []; for (let k = 0; k < Math.max(0, T); k++) f.push(width); f.push(2, 1, 1); return f; }
function wideFloorsR(width, num, reinf) { const T = num - 4 - reinf; const f = []; for (let k = 0; k < Math.max(0, T); k++) f.push(width); f.push(2, 1, 1); return f; }
// plan-view layout of a floor: people aligned (same height); some at the back (centre)
function layout(w) {
  if (w <= 1) return [{ dx: 0, dy: 0, back: false }];
  if (w === 2) return [{ dx: -0.34, dy: 0, back: false }, { dx: 0.34, dy: 0, back: false }];
  if (w === 3) return [{ dx: 0, dy: 0, back: true }, { dx: -0.56, dy: 0, back: false }, { dx: 0.56, dy: 0, back: false }];
  if (w === 4) return [{ dx: -0.32, dy: 0, back: true }, { dx: 0.32, dy: 0, back: true }, { dx: -0.66, dy: 0, back: false }, { dx: 0.66, dy: 0, back: false }];
  return [{ dx: -0.34, dy: 0, back: true }, { dx: 0.34, dy: 0, back: true }, { dx: -0.72, dy: 0, back: false }, { dx: 0, dy: 0, back: false }, { dx: 0.72, dy: 0, back: false }].slice(0, w);
}
function floorMul(fi, F, isPilar) { if (fi === F - 2) return isPilar ? 0.72 : 0.5; if (!isPilar && fi === F - 3) return 0.74; return 1; }
// A stylised village square with the town hall (ajuntament) behind.
function drawPlaca(groundY) {
  const by = groundY + 4;
  const OUT = "#2c2118", lw = Math.max(2, Math.round(W / 210));
  ctx.fillStyle = "#f7fbff";
  const cloud = (cx, cy, s) => { ctx.beginPath(); ctx.arc(cx - s, cy, s * 0.7, 0, 7); ctx.arc(cx, cy - s * 0.4, s * 0.95, 0, 7); ctx.arc(cx + s, cy, s * 0.75, 0, 7); ctx.arc(cx, cy + s * 0.25, s * 0.9, 0, 7); ctx.fill(); };
  cloud(W * 0.2, H * 0.12, 16); cloud(W * 0.82, H * 0.08, 20); cloud(W * 0.52, H * 0.2, 11);
  const star = (x, y, r) => { ctx.fillStyle = "#fff3bf"; ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r * 0.38 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); };
  star(W * 0.34, H * 0.1, 6); star(W * 0.7, H * 0.16, 5); star(W * 0.12, H * 0.23, 4);
  const facade = (x, w, topY, fill, flag) => {
    ctx.fillStyle = fill; ctx.fillRect(x, topY, w, by - topY);
    ctx.fillStyle = "rgba(0,0,0,.08)"; ctx.fillRect(x + w * 0.72, topY, w * 0.28, by - topY);
    ctx.fillStyle = darken(fill, 0.8); ctx.fillRect(x - 3, topY - 11, w + 6, 13);
    ctx.strokeStyle = OUT; ctx.lineWidth = lw; ctx.strokeRect(x, topY, w, by - topY); ctx.strokeRect(x - 3, topY - 11, w + 6, 13);
    const cols = Math.max(2, Math.round(w / 36)), cw = w / cols;
    for (let r = topY + 24; r < by - 30; r += 44) for (let ci = 0; ci < cols; ci++) {
      const ww = cw * 0.46, wx = x + ci * cw + (cw - ww) / 2, wh = 24;
      ctx.beginPath(); ctx.moveTo(wx, r + wh); ctx.lineTo(wx, r + ww / 2); ctx.arc(wx + ww / 2, r + ww / 2, ww / 2, Math.PI, 0); ctx.lineTo(wx + ww, r + wh); ctx.closePath();
      ctx.fillStyle = "#3c5d7a"; ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.2)"; ctx.fillRect(wx + 2, r + ww / 2, ww * 0.38, wh * 0.4);
      ctx.strokeStyle = OUT; ctx.lineWidth = lw * 0.7; ctx.stroke();
    }
    if (flag) {
      const px = x + w * 0.5, py = topY - 11;
      ctx.strokeStyle = "#6b5a44"; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py - 34); ctx.stroke();
      const fw = 26, fh = 17, fy = py - 34;
      ctx.fillStyle = "#f2c200"; ctx.fillRect(px, fy, fw, fh);
      ctx.fillStyle = "#d4231f"; for (let s = 0; s < 4; s++) ctx.fillRect(px, fy + fh * (0.1 + s * 0.24), fw, fh * 0.12);
      ctx.strokeStyle = OUT; ctx.lineWidth = lw * 0.8; ctx.strokeRect(px, fy, fw, fh);
    }
  };
  const tones = ["#e7c79a", "#dcb88a", "#e9cfa6", "#d2a878"];
  let hx = -12, seed = 2;
  while (hx < W) {
    const w = 58 + (seed * 37 % 30), edge = (hx < W * 0.16 || hx > W * 0.7);
    const topY = by - (edge ? H * (0.34 + (seed % 2) * 0.06) : 96 + (seed * 23 % 56));
    facade(hx, w, topY, tones[seed % tones.length], seed === 4);
    hx += w - 4; seed++;
  }
  ctx.fillStyle = "#d8c19a"; ctx.fillRect(0, by, W, H - by);
  ctx.fillStyle = "rgba(120,100,70,.16)"; ctx.fillRect(0, by, W, 7);
  ctx.strokeStyle = "rgba(90,80,60,.15)"; ctx.lineWidth = 1;
  for (let i = 1; i < 7; i++) { ctx.beginPath(); ctx.moveTo(W / 2 + (i - 3.5) * 80, by); ctx.lineTo(W / 2 + (i - 3.5) * 240, H); ctx.stroke(); }
}
function renderCastell(floors, file) {
  const grd = ctx.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, "#cfe3ee"); grd.addColorStop(1, "#e8eedf");
  ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);
  const groundY = H * 0.84;
  drawPlaca(groundY);
  const F = floors.length, maxW = Math.max.apply(null, floors), isPilar = maxW === 1;
  let acc = 0; for (let i = 0; i < F; i++) acc += floorMul(i, F, isPilar);
  levelH = Math.min(46, (groundY - H * 0.1) / (acc + 1.2));
  const baseY = groundY - 40 + levelH * 0.06, cxBase = W / 2;
  const colSpacing = levelH * 0.74;
  const reach = colSpacing * 0.92 / levelH;
  const fy = []; let c2 = 0; for (let i = 0; i < F; i++) { fy[i] = baseY - levelH * c2; c2 += floorMul(i, F, isPilar); }
  const drawFloor = (fi, part) => {
    const w = floors[fi], isEnx = fi === F - 1, isAcot = fi === F - 2;
    const kid = isEnx ? 0.65 : (isAcot ? 0.8 : 1);
    const spread = !isPilar && !isEnx && !isAcot; // trunk & dosos grip sideways
    const lay = layout(w).slice().sort((a,b)=>(a.back===b.back)?0:(a.back?-1:1));
    for (const c of lay) {
      const sc = (c.back ? 0.92 : 1) * kid;
      ctx.save(); ctx.translate(cxBase + c.dx * colSpacing, fy[fi] + c.dy * levelH); ctx.scale(sc, sc);
      drawCasteller(0, 0, fi, isEnx, isEnx, 1, false, part, { back: c.back, crouch: isAcot && !isPilar, legsApart: isEnx && !isPilar, helmet: isEnx || isAcot, spread: spread, reach: reach });
      ctx.restore();
    }
  };
  for (let i = 0; i < F; i++) drawFloor(i, 1);
  for (let i = 0; i < F; i++) drawFloor(i, 2);
  drawPinya(cxBase, groundY, Math.min(W * 0.46, 130 + maxW * 46));
  fs.writeFileSync(file, canvas.toBuffer("image/png"));
  console.log("wrote", file);
}
renderCastell(wideFloors(3, 7), "/tmp/wide.png");      // 3 de 7
renderCastell(wideFloors(4, 8), "/tmp/wide4.png");     // 4 de 8
renderCastell([1, 1, 1, 1], "/tmp/pilar.png");         // pilar de 5 (all standing, small kids)
renderCastell([3, 2, 1, 1], "/tmp/pom.png");           // short, to inspect the pom de dalt

// zoomed single figure for detail inspection
(function () {
  const grd = ctx.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, "#cfe3ee"); grd.addColorStop(1, "#e8eedf");
  ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);
  levelH = 220;
  ctx.save(); ctx.translate(W / 2, H * 0.78); drawCasteller(0, 0, 1, false, false, 1, false); ctx.restore();
  ctx.save(); ctx.translate(W / 2 - 130, H * 0.78); drawCasteller(0, 0, 5, true, true, 1, false); ctx.restore();
  fs.writeFileSync("/tmp/figure.png", canvas.toBuffer("image/png"));
  console.log("wrote /tmp/figure.png");
})();

// ---- Multi-pose sprite preview ----
const napi = require('@napi-rs/canvas');
function rgb2hsv(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),df=mx-mn;let h=0;if(df){if(mx===r)h=((g-b)/df)%6;else if(mx===g)h=(b-r)/df+2;else h=(r-g)/df+4;h*=60;if(h<0)h+=360;}return[h,mx?df/mx:0,mx];}
function hsv2rgb(h,s,v){const cc=v*s,xx=cc*(1-Math.abs((h/60)%2-1)),m=v-cc;let r,g,b;if(h<60){r=cc;g=xx;b=0;}else if(h<120){r=xx;g=cc;b=0;}else if(h<180){r=0;g=cc;b=xx;}else if(h<240){r=0;g=xx;b=cc;}else if(h<300){r=xx;g=0;b=cc;}else{r=cc;g=0;b=xx;}return[(r+m)*255,(g+m)*255,(b+m)*255];}
function recolor(img,hex){const W2=img.width,H2=img.height;const c=napi.createCanvas(W2,H2),x=c.getContext('2d');x.drawImage(img,0,0);const id=x.getImageData(0,0,W2,H2),d=id.data;const th=rgb2hsv(parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16))[0];for(let i=0;i<d.length;i+=4){if(d[i+3]<10)continue;const[h,s,v]=rgb2hsv(d[i],d[i+1],d[i+2]);if(s>0.45&&v>0.22&&(h<18||h>340)){const[nr,ng,nb]=hsv2rgb(th,Math.min(1,s),v);d[i]=nr;d[i+1]=ng;d[i+2]=nb;}}x.putImageData(id,0,0);return c;}
const GEO = {
  tronc:{feetY:676,cx:256,anchor:500}, esquena:{feetY:558,cx:212,anchor:430},
  perfil:{feetY:684,cx:180,anchor:502}, pilar:{feetY:726,cx:257,anchor:505},
  enx:{feetY:711,cx:261,anchor:525},
  acot:{feetY:516,cx:210,anchor:380}, enxw:{feetY:560,cx:202,anchor:490},
  pinya:{feetY:596,headY:61,cx:210,anchor:502}, pinyaD:{feetY:589,headY:66,cx:210,anchor:507}, pinyaE:{feetY:589,headY:60,cx:211,anchor:507},
};
const SP = {};
function pinyaPositions(cx, gy, radius){
  const step=levelH*0.34, rowGap=levelH*0.13;
  const rows=[{dy:-3*rowGap,hw:radius*0.55},{dy:-2*rowGap,hw:radius*0.80},{dy:-1*rowGap,hw:radius*1.00},{dy:0,hw:radius*1.12}];
  const pts=[];
  rows.forEach((row,ri)=>{
    const ry=gy+row.dy;
    const count=Math.max(1,Math.floor((row.hw*2)/step)+1);
    const startX=cx-(count-1)*step/2+(ri%2)*step*0.5;
    for(let i=0;i<count;i++){const x=startX+i*step; pts.push({x:x,ry:ry,d:Math.abs(x-cx)});}
  });
  return pts;
}
function drawCrowd(cx, pts){
  const th=levelH*0.34*0.4;
  pts=pts.slice().sort((a,b)=>b.d-a.d);
  for(const p of pts){
    let name = p.x < cx-th ? 'pinyaE' : (p.x > cx+th ? 'pinyaD' : 'pinya');
    const g=GEO[name], img=SP[name]; if(!img) continue;
    const sc=levelH/g.anchor;
    ctx.save(); ctx.translate(p.x, p.ry); ctx.drawImage(img, -g.cx*sc, -g.feetY*sc, img.width*sc, img.height*sc); ctx.restore();
  }
}
function drawPinyaSpr(cx, gy, radius){ drawCrowd(cx, pinyaPositions(cx, gy, radius)); }
function drawRing(cx, gy, radius, limit){
  const pts=pinyaPositions(cx, gy, radius).sort((a,b)=>a.d-b.d).slice(0, Math.max(1,limit));
  drawCrowd(cx, pts);
}
function drawSp(name, x, y, mirror, kid){
  const img=SP[name], g=GEO[name]; if(!img) return false;
  const scale=(levelH/g.anchor)*(kid||1);
  ctx.save(); ctx.translate(x,y); if(mirror) ctx.scale(-1,1);
  ctx.drawImage(img, -g.cx*scale, -g.feetY*scale, img.width*scale, img.height*scale);
  ctx.restore(); return true;
}
function renderMulti(floors, file, base){
  base = base || ['la pinya'];
  const grd=ctx.createLinearGradient(0,0,0,H);grd.addColorStop(0,'#5fb0e6');grd.addColorStop(0.6,'#9fd2ef');grd.addColorStop(1,'#d6ecf6');ctx.fillStyle=grd;ctx.fillRect(0,0,W,H);
  const groundY=H*0.84; drawPlaca(groundY);
  const F=floors.length, maxW=Math.max.apply(null,floors), isPilar=maxW===1;
  let acc=0; for(let i=0;i<F;i++) acc+=floorMul(i,F,isPilar);
  const nReinf=base.length-1;
  levelH=Math.min(64,(groundY-H*0.05)/(acc+nReinf+1.5));
  const baseLift=levelH*0.8, baseLayerY=(i)=>groundY-(i===0?0:baseLift+(i-1)*levelH);
  const baseY=groundY-baseLift-nReinf*levelH+levelH*0.06, cxBase=W/2, colSpacing=levelH*(isPilar?0.7:0.66);
  const fy=[];let c2=0;for(let i=0;i<F;i++){fy[i]=baseY-levelH*c2;c2+=floorMul(i,F,isPilar);}
  const kidScale=(fi)=> fi===F-1?0.72 : fi===F-2?0.74 : (!isPilar&&fi===F-3&&floors[fi]>=2?0.8:1);
  const yLift=(fi)=> fi===F-1?levelH*0.14:0;
  for(let fi=F-1;fi>=0;fi--){
    const w=floors[fi], isEnx=fi===F-1, isAcot=fi===F-2, kid=kidScale(fi);
    const lay=layout(w).slice().sort((a,b)=>(a.back===b.back)?0:(a.back?-1:1));
    for(const c of lay){
      const x=cxBase+c.dx*colSpacing, y=fy[fi]+c.dy*levelH-yLift(fi);
      let done=false;
      if(isPilar){
        if(isEnx) done=drawSp('enx',x,y,false,kid);
        else done=drawSp('pilar',x,y,false,kid);
      } else if(isEnx){ done=drawSp('enxw',x,y,false,kid);
      } else if(isAcot){ done=drawSp('acot',x,y,false,kid);
      } else { // trunk/dosos
        if(c.back) done=drawSp('esquena',x,y,false,kid);
        else done=drawSp('perfil',x,y,c.dx>0,kid); // right side mirrored
      }
      if(!done){
        const sc=(c.back?0.92:1)*kid;
        ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);
        drawCasteller(0,0,fi,isEnx,isEnx,1,false,0,{back:c.back,crouch:isAcot&&!isPilar,legsApart:isEnx&&!isPilar,helmet:isEnx||isAcot,spread:!isPilar&&!isEnx&&!isAcot,reach:colSpacing*0.92/levelH});
        ctx.restore();
      }
    }
  }
  const pinyaR=Math.min(W*0.46,130+maxW*46);
  const pinyaN=SP.pinya?pinyaPositions(cxBase,groundY,pinyaR).length:0;  // 0 → vector fallback (like the game)
  base.forEach((name,i)=>{
    const y=baseLayerY(i);
    if(name==='el folre') pinyaN?drawRing(cxBase,y,pinyaR*0.82,Math.round(pinyaN*0.5)):drawPinya(cxBase,y,pinyaR*0.74);
    else if(name==='les manilles') pinyaN?drawRing(cxBase,y,pinyaR*0.6,Math.round(pinyaN*0.25)):drawPinya(cxBase,y,pinyaR*0.54);
    else (SP.pinya?drawPinyaSpr(cxBase,y,pinyaR):drawPinya(cxBase,y,pinyaR));
  });
  fs.writeFileSync(file,canvas.toBuffer('image/png'));console.log('wrote',file);
}
(async()=>{
  const map={tronc:'casteller_tronc',esquena:'casteller_tronc_esquena',perfil:'casteller_perfil',pilar:'casteller_pilar',enx:'casteller_enxaneta_pilar',acot:'casteller_acotxador',enxw:'casteller_enxaneta',pinya:'casteller_pinya',pinyaD:'casteller_pinya_dreta',pinyaE:'casteller_pinya_esquerra'};
  for(const k in map){ try{ SP[k]=recolor(await napi.loadImage('assets/'+map[k]+'.png'),'#2f6f8f'); }catch(e){ console.log('miss',k,e.message); } }
  renderMulti(wideFloors(3,7),'/tmp/m3de7.png');
  renderMulti(pilarFloorsQA(5),'/tmp/mpilar.png');
  renderMulti(pilarFloorsQA(8-2),'/tmp/mp8.png',['la pinya','el folre','les manilles']);
  renderMulti(wideFloors(2,6),'/tmp/t2de6.png');
  renderMulti(wideFloors(5,7),'/tmp/t5de7.png');
  renderMulti(wideFloorsR(3,9,1),'/tmp/t3de9f.png',['la pinya','el folre']);
  renderMulti(wideFloorsR(2,9,2),'/tmp/t2de9fm.png',['la pinya','el folre','les manilles']);
  renderMulti(wideFloorsR(3,10,2),'/tmp/t3de10fm.png',['la pinya','el folre','les manilles']);
  for(const k in SP) delete SP[k];   // vector (illustrated) preview — no photo sprites
  renderMulti(wideFloors(3,7),'/tmp/vec3de7.png');
  renderMulti(pilarFloorsQA(5),'/tmp/vecpilar.png');
})();
function pilarFloorsQA(num){const f=[];for(let k=0;k<num-1;k++)f.push(1);return f;}
