// Erzeugt App-Icons aus SVG (Hexagon + Neon-Puls) als PNGs fuer @capacitor/assets
// und aktualisiert das Web-/PWA-Icon. Aufruf: node scripts/gen_icons.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const assets = join(repo, "assets");
mkdirSync(assets, { recursive: true });

const TEAL = "#3b82f6";
const VIOLET = "#818cf8";

// Distinktives Glyph: Radar-Ring + EKG-Puls, der subtil ein "M" zeichnet
// (Monitor). Steht fuer Beobachtung und Aktivitaet des Bundes.
const PULSE = "252,640 336,640 420,384 512,556 604,384 688,640 772,640";

function glyph() {
  const r = 292;
  const rr = 246;
  return `
  <!-- Glow-Unterlagen -->
  <circle cx="512" cy="512" r="${r}" fill="none" stroke="${TEAL}" stroke-opacity="0.16" stroke-width="54"/>
  <polyline points="${PULSE}" fill="none" stroke="${TEAL}" stroke-opacity="0.18" stroke-width="46" stroke-linecap="round" stroke-linejoin="round"/>
  <!-- Radar-Ring (solide Farbe) -->
  <circle cx="512" cy="512" r="${r}" fill="none" stroke="${TEAL}" stroke-width="24"/>
  <!-- Sweep-Bogen (Radar) -->
  <path d="M512,${512 - rr} A${rr},${rr} 0 0 1 ${512 + rr},512" fill="none" stroke="${VIOLET}" stroke-width="16" stroke-linecap="round" stroke-opacity="0.9"/>
  <!-- Puls (M-Form) -->
  <polyline points="${PULSE}" fill="none" stroke="${TEAL}" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>
  <!-- Knoten am Puls-Ausschlag -->
  <circle cx="420" cy="384" r="22" fill="${TEAL}"/>
  <circle cx="420" cy="384" r="38" fill="none" stroke="${TEAL}" stroke-opacity="0.4" stroke-width="7"/>`;
}

function gridLines() {
  let l = "";
  for (let p = 64; p < 1024; p += 64) {
    l += `<line x1="${p}" y1="0" x2="${p}" y2="1024"/><line x1="0" y1="${p}" x2="1024" y2="${p}"/>`;
  }
  return `<g stroke="${TEAL}" stroke-opacity="0.05" stroke-width="1">${l}</g>`;
}

const background = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="#0d1320"/>
  ${gridLines()}
</svg>`;

const foreground = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${glyph(1)}</svg>`;
const iconOnlyGlyph = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${glyph(1.08)}</svg>`;

async function run() {
  const bg = await sharp(Buffer.from(background)).png().toBuffer();
  const fg = await sharp(Buffer.from(foreground)).png().toBuffer();
  const fgBig = await sharp(Buffer.from(iconOnlyGlyph)).png().toBuffer();

  writeFileSync(join(assets, "icon-background.png"), bg);
  writeFileSync(join(assets, "icon-foreground.png"), fg);

  const iconOnly = await sharp(bg).composite([{ input: fgBig }]).png().toBuffer();
  writeFileSync(join(assets, "icon-only.png"), iconOnly);
  writeFileSync(join(assets, "logo.png"), iconOnly);

  // Web-/PWA-Icon (SVG) aktualisieren: Hintergrund + Glyph zusammengesetzt.
  const webSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 1024 1024" role="img" aria-label="Bundesmonitor">
  <rect width="1024" height="1024" rx="180" fill="#0d1320"/>
  ${glyph()}
</svg>`;
  writeFileSync(join(repo, "apps", "web", "public", "icon.svg"), webSvg);
  writeFileSync(join(repo, "apps", "web", "app", "icon.svg"), webSvg);

  console.log("Icons erzeugt in assets/ und Web-Icon aktualisiert.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
