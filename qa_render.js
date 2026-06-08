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
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.4; ctx.stroke(); }
}

// ---- BEGIN copy of drawCasteller (keep in sync with index.html) ----
function drawCasteller(x, y, idx, isTop, aleta, alpha, climbing, part) {
  part = part || 0; // 0=all, 1=body only, 2=head only
  const u = levelH;
  const L = u * 0.55, T = u * 0.45;
  const breath = Math.sin(ANIM * 1.8 + idx * 0.9) * u * 0.012;
  const hipY = -L, shoY = -(L + T) - breath;
  const sw = u * (isTop ? 0.155 : 0.185);
  const hw = u * 0.1;
  const fs = u * 0.185;            // feet rest on the shoulders below (wide enough for the head to show)
  const R = u * 0.135;
  const headY = shoY - R * 1.02;
  const OUT = "#202a31";
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
    ctx.fillStyle = "#39302a"; ctx.strokeStyle = OUT; ctx.lineWidth = 1.2;
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
    const g = ctx.createLinearGradient(-sw, 0, sw, 0);
    g.addColorStop(0, COLLA.shirtDark); g.addColorStop(0.4, COLLA.shirt); g.addColorStop(0.62, COLLA.shirt); g.addColorStop(1, COLLA.shirtDark);
    ctx.fillStyle = g; ctx.strokeStyle = OUT; ctx.lineWidth = 1.6;
    torsoPath(); ctx.fill(); ctx.stroke();
    ctx.save(); torsoPath(); ctx.clip();
    const gv = ctx.createLinearGradient(0, shoY, 0, hipY);
    gv.addColorStop(0, "rgba(255,255,255,.16)"); gv.addColorStop(0.5, "rgba(255,255,255,0)"); gv.addColorStop(1, "rgba(0,0,0,.16)");
    ctx.fillStyle = gv; torsoPath(); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.1)";
    ctx.beginPath(); ctx.ellipse(-sw * 0.3, shoY + T * 0.35, sw * 0.35, T * 0.4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // --- faixa ---
    ctx.fillStyle = COLLA.faixa;
    ctx.beginPath(); roundRect(-hw * 1.25, hipY - u * 0.04, hw * 2.5, u * 0.18, u * 0.03); ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,.35)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-hw, hipY + u * 0.04); ctx.lineTo(hw, hipY + u * 0.04); ctx.stroke();

    // --- arms ---
    if (aleta) {
      arm(sw * 0.7, shoY + u * 0.05, sw * 1.1, shoY - u * 0.12, sw * 1.32, shoY - u * 0.56);
      arm(-sw * 0.7, shoY + u * 0.05, -sw * 1.05, hipY - u * 0.08, -hw * 1.15, hipY + u * 0.02);
    } else if (climbing) {
      arm(-sw * 0.6, shoY + u * 0.05, -sw * 0.5, shoY - u * 0.2, -u * 0.07, shoY - u * 0.46);
      arm(sw * 0.6, shoY + u * 0.05, sw * 0.5, shoY - u * 0.2, u * 0.07, shoY - u * 0.46);
    } else {
      arm(-sw * 0.75, shoY + u * 0.05, -sw * 1.02, shoY - u * 0.04, -fs * 0.95, shoY - u * 0.22);
      arm(sw * 0.75, shoY + u * 0.05, sw * 1.02, shoY - u * 0.04, fs * 0.95, shoY - u * 0.22);
    }
  }

  if (part !== 1) {
    // --- neck + head (drawn in a later pass so legs never cover the face) ---
    ctx.fillStyle = COLLA.skin; ctx.strokeStyle = OUT; ctx.lineWidth = 1.4;
    ctx.beginPath(); roundRect(-u * 0.05, shoY - u * 0.06, u * 0.1, u * 0.1, u * 0.03); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, headY, R * 0.92, R, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.ellipse(0, headY, R * 0.92, R, 0, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = "rgba(0,0,0,.08)"; ctx.fillRect(R * 0.25, headY - R, R, R * 2);
    ctx.fillStyle = "#33271c";
    ctx.beginPath(); ctx.ellipse(-R * 0.82, headY + R * 0.1, R * 0.3, R * 0.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(R * 0.82, headY + R * 0.1, R * 0.3, R * 0.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = COLLA.shirt; ctx.fillRect(-R, headY - R * 1.05, R * 2, R * 0.95);
    ctx.fillStyle = darken(COLLA.shirt, 0.78); ctx.fillRect(-R, headY - R * 0.12, R * 2, R * 0.06);
    ctx.restore();
    ctx.fillStyle = COLLA.shirt; ctx.strokeStyle = OUT; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(R * 0.86, headY - R * 0.25, R * 0.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#2a2018";
    ctx.beginPath(); ctx.arc(-R * 0.32, headY + R * 0.22, R * 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(R * 0.32, headY + R * 0.22, R * 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(120,75,55,.55)"; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(0, headY + R * 0.2); ctx.lineTo(-R * 0.06, headY + R * 0.42); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, headY + R * 0.5, R * 0.24, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
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
function renderCastell(floors, file) {
  const grd = ctx.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, "#cfe3ee"); grd.addColorStop(1, "#e8eedf");
  ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);
  const groundY = H * 0.84;
  ctx.fillStyle = "#d8cfb8"; ctx.fillRect(0, groundY + 4, W, H);
  const F = floors.length, maxW = Math.max.apply(null, floors);
  levelH = Math.min(46, (groundY - H * 0.1) / (F + 1));
  const baseY = groundY - 40 + levelH * 0.06, cxBase = W / 2;
  const colSpacing = levelH * 0.44;
  const drawFloor = (i, part) => {
    const w = floors[i];
    for (let j = 0; j < w; j++) {
      const x = cxBase + (j - (w - 1) / 2) * colSpacing;
      const isEnx = i === F - 1;
      ctx.save(); ctx.translate(x, baseY - levelH * i); drawCasteller(0, 0, i, isEnx, isEnx, 1, false, part); ctx.restore();
    }
  };
  for (let i = 0; i < F; i++) drawFloor(i, 1);
  for (let i = 0; i < F; i++) drawFloor(i, 2);
  drawPinya(cxBase, groundY, Math.min(W * 0.46, 150 + maxW * 42));
  fs.writeFileSync(file, canvas.toBuffer("image/png"));
  console.log("wrote", file);
}
renderCastell(wideFloors(3, 7), "/tmp/wide.png");      // 3 de 7
renderCastell(wideFloors(4, 8), "/tmp/wide4.png");     // 4 de 8

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
