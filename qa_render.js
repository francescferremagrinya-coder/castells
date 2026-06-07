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
function drawCasteller(x, y, idx, isTop, aleta, alpha, climbing) {
  const u = levelH;
  const L = u * 0.55, T = u * 0.45;
  const hipY = -L, shoY = -(L + T);
  const sw = u * (isTop ? 0.155 : 0.185);
  const hw = u * 0.1;
  const fs = u * 0.165;
  const R = u * 0.145;
  const headY = shoY - R * 1.12;
  const OUT = "#202a31";
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  const hand = (hx, hy) => {
    ctx.fillStyle = COLLA.skin; ctx.strokeStyle = OUT; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.arc(hx, hy, u * 0.05, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  };
  // arm: short shirt sleeve to the elbow, then bare forearm to the hand
  const arm = (sx, sy, ex, ey, hx, hy) => {
    quadLimb(sx, sy, u * 0.06, ex, ey, u * 0.05, COLLA.shirt, OUT);   // sleeve
    quadLimb(ex, ey, u * 0.045, hx, hy, u * 0.038, COLLA.skin, OUT);  // forearm
    hand(hx, hy);
  };

  // --- legs (trousers) + shoes ---
  quadLimb(-fs, 0, u * 0.082, -hw, hipY, u * 0.088, COLLA.pants, "rgba(27,39,48,.3)");
  quadLimb(fs, 0, u * 0.082, hw, hipY, u * 0.088, COLLA.pants, "rgba(27,39,48,.3)");
  ctx.fillStyle = "#39302a"; ctx.strokeStyle = OUT; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.ellipse(-fs, 1, u * 0.105, u * 0.052, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(fs, 1, u * 0.105, u * 0.052, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

  // --- torso (shirt) with shading ---
  const g = ctx.createLinearGradient(-sw, 0, sw, 0);
  g.addColorStop(0, COLLA.shirtDark); g.addColorStop(0.4, COLLA.shirt); g.addColorStop(0.62, COLLA.shirt); g.addColorStop(1, COLLA.shirtDark);
  ctx.fillStyle = g; ctx.strokeStyle = OUT; ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-hw, hipY + u * 0.04);
  ctx.lineTo(-sw, shoY + u * 0.06);
  ctx.quadraticCurveTo(-sw, shoY - u * 0.05, -sw * 0.5, shoY - u * 0.05);
  ctx.lineTo(sw * 0.5, shoY - u * 0.05);
  ctx.quadraticCurveTo(sw, shoY - u * 0.05, sw, shoY + u * 0.06);
  ctx.lineTo(hw, hipY + u * 0.04);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // highlight stripe
  ctx.fillStyle = "rgba(255,255,255,.12)";
  ctx.beginPath(); roundRect(-sw * 0.45, shoY, u * 0.06, T * 0.8, u * 0.02); ctx.fill();

  // --- faixa ---
  ctx.fillStyle = COLLA.faixa;
  ctx.beginPath(); roundRect(-hw * 1.25, hipY - u * 0.04, hw * 2.5, u * 0.18, u * 0.03); ctx.fill();

  // --- arms (in front of torso so the gripping reads) ---
  if (aleta) {
    arm(sw * 0.7, shoY + u * 0.05, sw * 1.1, shoY - u * 0.12, sw * 1.35, shoY - u * 0.55); // raised
    arm(-sw * 0.7, shoY + u * 0.05, -sw * 1.05, hipY - u * 0.08, -hw * 1.15, hipY + u * 0.02); // resting
  } else if (climbing) {
    arm(-sw * 0.6, shoY + u * 0.05, -sw * 0.5, shoY - u * 0.2, -u * 0.07, shoY - u * 0.46);
    arm(sw * 0.6, shoY + u * 0.05, sw * 0.5, shoY - u * 0.2, u * 0.07, shoY - u * 0.46);
  } else {
    // reach up and grip the calves of the casteller above (to the sides)
    arm(-sw * 0.75, shoY + u * 0.05, -sw * 1.0, shoY - u * 0.04, -fs * 0.95, shoY - u * 0.22);
    arm(sw * 0.75, shoY + u * 0.05, sw * 1.0, shoY - u * 0.04, fs * 0.95, shoY - u * 0.22);
  }

  // --- neck + head ---
  ctx.fillStyle = COLLA.skin; ctx.strokeStyle = OUT; ctx.lineWidth = 1.4;
  ctx.beginPath(); roundRect(-u * 0.05, shoY - u * 0.06, u * 0.1, u * 0.1, u * 0.03); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, headY, R, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // hair
  ctx.fillStyle = "#3a2c20";
  ctx.beginPath(); ctx.arc(0, headY, R, Math.PI * 1.12, Math.PI * 1.88); ctx.fill();
  // bandana (mocador) band across the forehead
  ctx.strokeStyle = COLLA.shirt; ctx.lineWidth = u * 0.05; ctx.lineCap = "round";
  ctx.beginPath(); ctx.arc(0, headY, R * 0.92, Math.PI * 1.18, Math.PI * 1.82); ctx.stroke();
  ctx.lineCap = "round";
  // face
  ctx.fillStyle = "#2a2018";
  ctx.beginPath(); ctx.arc(-R * 0.33, headY + R * 0.18, R * 0.12, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(R * 0.33, headY + R * 0.18, R * 0.12, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(120,70,50,.5)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(0, headY + R * 0.38, R * 0.28, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();

  ctx.restore();
}
function darken(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * f), g = Math.round(((n >> 8) & 255) * f), b = Math.round((n & 255) * f);
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}
// The pinya: a packed crowd seen from above/behind. Heads and mocadors (some of
// each) with arms over each other's shoulders — as done with no folre.
function drawPinya(cx, gy, radius) {
  const OUT = "#202a31";
  const rows = [
    { n: 9, y: -40, s: 8.5, spread: 0.86 },
    { n: 11, y: -22, s: 9.5, spread: 0.96 },
    { n: 13, y: -2, s: 10.5, spread: 1.04 },
  ];
  for (const row of rows) {
    const ry = gy + row.y, s = row.s, span = radius * row.spread;
    const px = (i) => cx - span + (row.n === 1 ? 0.5 : i / (row.n - 1)) * span * 2;
    // backs / shoulders
    for (let i = 0; i < row.n; i++) {
      const x = px(i);
      const grd = ctx.createLinearGradient(x - s, 0, x + s, 0);
      grd.addColorStop(0, COLLA.shirtDark); grd.addColorStop(0.5, COLLA.shirt); grd.addColorStop(1, COLLA.shirtDark);
      ctx.fillStyle = grd; ctx.strokeStyle = OUT; ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(x - s * 1.25, ry + s * 1.5);
      ctx.quadraticCurveTo(x - s * 1.3, ry - s * 0.45, x, ry - s * 0.55);
      ctx.quadraticCurveTo(x + s * 1.3, ry - s * 0.45, x + s * 1.25, ry + s * 1.5);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    // arms draped over the neighbours' shoulders (the lock without folre)
    ctx.strokeStyle = COLLA.shirtDark; ctx.lineWidth = s * 0.55; ctx.lineCap = "round";
    for (let i = 0; i < row.n - 1; i++) {
      const a = px(i), b = px(i + 1);
      ctx.beginPath();
      ctx.moveTo(a + s * 0.15, ry + s * 0.05);
      ctx.quadraticCurveTo((a + b) / 2, ry - s * 0.95, b - s * 0.15, ry + s * 0.05);
      ctx.stroke();
    }
    // heads — alternate mocador (colla colour) and bare head
    for (let i = 0; i < row.n; i++) {
      const x = px(i), hy = ry - s * 0.65, hr = s * 0.7;
      ctx.fillStyle = COLLA.skin; ctx.strokeStyle = OUT; ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.arc(x, hy, hr, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      if ((i * 3 + row.n) % 2 === 0) {
        ctx.fillStyle = COLLA.shirt; // mocador
        ctx.beginPath(); ctx.arc(x, hy, hr, Math.PI * 1.02, Math.PI * 1.98); ctx.fill();
        ctx.strokeStyle = OUT; ctx.lineWidth = 1.1; ctx.stroke();
      } else {
        ctx.fillStyle = "#3a2c20"; // hair
        ctx.beginPath(); ctx.arc(x, hy, hr, Math.PI * 1.08, Math.PI * 1.92); ctx.fill();
      }
    }
  }
}
// ---- END copy ----

function render(placed, climbing, goingUp, prog, file) {
  // bg
  const grd = ctx.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, "#cfe3ee"); grd.addColorStop(1, "#e8eedf");
  ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);
  const groundY = H * 0.84;
  ctx.fillStyle = "#d8cfb8"; ctx.fillRect(0, groundY + 4, W, H);
  levelH = Math.min(48, (groundY - H * 0.12) / N);
  const pinyaTop = groundY - 40;
  const baseY = pinyaTop + levelH * 0.06;
  const cxBase = W / 2;
  const drawAt = (lvl, idx, isTop, aleta, climb) => {
    ctx.save();
    ctx.translate(cxBase, baseY - levelH * lvl);
    drawCasteller(0, 0, idx, isTop, aleta, 1, climb);
    ctx.restore();
  };
  if (climbing && goingUp) drawAt(placed * prog, placed, placed === N - 1, false, true);
  for (let i = 0; i < placed; i++) drawAt(i, i, i === N - 1, i === N - 1, false);
  if (climbing && !goingUp) drawAt(placed * (1 - prog), placed, placed === N - 1, false, true);
  drawPinya(cxBase, groundY, Math.min(W * 0.44, 230));
  fs.writeFileSync(file, canvas.toBuffer("image/png"));
  console.log("wrote", file);
}

render(6, false, true, 0, "/tmp/full.png");
render(3, true, true, 0.6, "/tmp/climb.png");
