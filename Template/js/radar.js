/* ═══════════════════════════════════════════════════════════════════════════
   radar.js  —  Player Attribute Radar Charts  (2 × 2 grid)
   Vis 4: Nick Emanwori  |  Avg Safety
   Vis 5: Kyle Pitts     |  Avg TE
   All stat values = percentile vs positional average (0–100).
   50 = exactly average. 90 = top 10% at that position.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ─── PLAYER DATA ─────────────────────────────────────────────────────────────
   Replace the 50s with real percentile numbers when you have them.
   ─────────────────────────────────────────────────────────────────────────── */
const RADAR_DATA = {

  /* Vis 4 — left chart */
  emanwori: {
    label:  "Nick Emanwori",
    color:  "#f59e0b",
    stats: {
      height:    97.9,  /* ← fill in */
      weight:    95.1,  /* ← fill in */
      tenYard: 94.4,  /* ← fill in */
      fortyYard: 98.7,  /* ← fill in */
      broadJump: 99.9,  /* ← fill in */
      vertical:  99.8   /* ← fill in */
    }
  },

  /* Vis 4 — right chart */
  avgSafety: {
    label:  "Avg Safety",
    color:  "#4ade80",
    stats: {
      height:    69.4,
      weight:    69.2,
      tenYard:  76.5,
      fortyYard: 58.2,
      broadJump: 54.7,
      vertical:  76.3
    }
  },

  /* Vis 5 — left chart */
  pitts: {
    label:  "Kyle Pitts",
    color:  "#38bdf8",
    stats: {
      height:    95.5,
      weight:    88.2,
      tenYard: 84.3,
      fortyYard: 89.4,
      broadJump: 84.6,
      vertical:  85
    }
  },

  /* Vis 5 — right chart */
  avgTE: {
    label:  "Avg TE",
    color:  "#4ade80",
    stats: {
      height:    55.9,
      weight:    61.6,
      tenYard: 59.1,
      fortyYard: 72.1,
      broadJump: 62.5,
      vertical:  73.3
    }
  }
};

/* ─── AXIS ORDER (clockwise from top, matching sketch) ───────────────────── */
const RADAR_AXES = [
  { key: "height",    label: "Height"        },
  { key: "weight",    label: "Weight"        },
  { key: "tenYard", label: "10-Yard\nSplit"   },
  { key: "fortyYard", label: "40-Yard\nDash" },
  { key: "broadJump", label: "Broad\nJump"   },
  { key: "vertical",  label: "Vert"          }
];

/* ─── DRAW ONE RADAR ─────────────────────────────────────────────────────────
   canvasId : id of <canvas>
   data     : one entry from RADAR_DATA
   ─────────────────────────────────────────────────────────────────────────── */
function drawOneRadar(canvasId, data) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx   = canvas.getContext("2d");
  const W     = canvas.width;
  const H     = canvas.height;
  const cx    = W / 2;
  const cy    = H / 2;
  const R     = Math.min(W, H) * 0.34;
  const N     = RADAR_AXES.length;
  const RINGS = 4;

  ctx.clearRect(0, 0, W, H);

  /* polar → cartesian (0 = top, clockwise) */
  function pt(val, idx) {
    const angle = (Math.PI * 2 * idx / N) - Math.PI / 2;
    const r = (val / 100) * R;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  /* spoke endpoint */
  function spoke(idx) {
    const angle = (Math.PI * 2 * idx / N) - Math.PI / 2;
    return { x: cx + R * Math.cos(angle), y: cy + R * Math.sin(angle) };
  }

  /* ── grid rings ───────────────────────────────────────────────────────── */
  for (let ring = 1; ring <= RINGS; ring++) {
    const rr = (ring / RINGS) * R;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const angle = (Math.PI * 2 * i / N) - Math.PI / 2;
      const x = cx + rr * Math.cos(angle);
      const y = cy + rr * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = ring === RINGS
      ? "rgba(100,116,139,0.6)"
      : "rgba(51,65,85,0.45)";
    ctx.lineWidth = ring === RINGS ? 1.2 : 0.7;
    ctx.stroke();
  }

  /* ── spokes ───────────────────────────────────────────────────────────── */
  for (let i = 0; i < N; i++) {
    const s = spoke(i);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(s.x, s.y);
    ctx.strokeStyle = "rgba(51,65,85,0.6)";
    ctx.lineWidth   = 0.8;
    ctx.stroke();
  }

  /* ── axis labels ──────────────────────────────────────────────────────── */
  const PAD = 20;
  ctx.font      = "bold 9px 'Barlow Condensed', sans-serif";
  ctx.fillStyle = "#94a3b8";

  for (let i = 0; i < N; i++) {
    const angle = (Math.PI * 2 * i / N) - Math.PI / 2;
    const lx    = cx + (R + PAD) * Math.cos(angle);
    const ly    = cy + (R + PAD) * Math.sin(angle);
    const lines = RADAR_AXES[i].label.split("\n");

    ctx.textAlign    = Math.abs(Math.cos(angle)) < 0.1 ? "center"
                     : Math.cos(angle) > 0             ? "left"
                                                       : "right";
    ctx.textBaseline = Math.abs(Math.sin(angle)) < 0.1 ? "middle"
                     : Math.sin(angle) > 0             ? "top"
                                                       : "bottom";

    const LH = 11;
    const sy = ly - ((lines.length - 1) * LH) / 2;
    lines.forEach((ln, li) => ctx.fillText(ln, lx, sy + li * LH));
  }

  /* ── filled polygon ───────────────────────────────────────────────────── */
  ctx.beginPath();
  RADAR_AXES.forEach((axis, i) => {
    const p = pt(data.stats[axis.key], i);
    i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
  });
  ctx.closePath();

  ctx.globalAlpha = 0.25;
  ctx.fillStyle   = data.color;
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.strokeStyle = data.color;
  ctx.lineWidth   = 2.2;
  ctx.lineJoin    = "round";
  ctx.stroke();

  /* ── vertex dots ──────────────────────────────────────────────────────── */
  RADAR_AXES.forEach((axis, i) => {
    const p = pt(data.stats[axis.key], i);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle   = data.color;
    ctx.fill();
    ctx.strokeStyle = "#070d1a";
    ctx.lineWidth   = 1.5;
    ctx.stroke();
  });
}

/* ─── INIT ───────────────────────────────────────────────────────────────── */
function initRadar() {
  drawOneRadar("radarEmanwori",  RADAR_DATA.emanwori);
  drawOneRadar("radarAvgSafety", RADAR_DATA.avgSafety);
  drawOneRadar("radarPitts",     RADAR_DATA.pitts);
  drawOneRadar("radarAvgTE",     RADAR_DATA.avgTE);
}

document.addEventListener("DOMContentLoaded", initRadar);
