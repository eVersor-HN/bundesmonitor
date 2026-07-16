// Erzeugt App-Icons aus SVG als PNGs fuer @capacitor/assets und aktualisiert das
// Web-/PWA-Icon. Das Glyph entspricht exakt dem In-App-Logo (BrandMark in
// apps/web/app/layout.tsx): Scope-Ring + Live-Puls-Kurve (EKG-artig) + Live-Node,
// dazu ein dezenter Chromatic-Aberration-Ghost (Magenta) fuer den HUD-Look.
// Aufruf: node scripts/gen_icons.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const assets = join(repo, "assets");
mkdirSync(assets, { recursive: true });

// Azur-Akzent (bm-accent, dunkles Theme) + Magenta-Ghost wie im BrandMark.
const ACCENT = "#57a9ef";
const GHOST = "#ff3d9a";

// BrandMark ist in viewBox 32 definiert. Wir skalieren um das Zentrum (16,16)
// auf 1024 (cx/cy = 512). Skalierung s = R/12 mit Ring-Radius R = 300, s = 25.
// Puls-Kurve absolut (BrandMark: M6.5 16.5 h5 l2-5 3 9.5 2-4.5 h7):
//   6.5,16.5 -> 11.5,16.5 -> 13.5,11.5 -> 16.5,21 -> 18.5,16.5 -> 25.5,16.5
// Auf 1024 gemappt (x -> 512+(x-16)*25, y -> 512+(y-16)*25):
const PULSE = "M274.5,524.5 H399.5 L449.5,399.5 L524.5,637 L574.5,524.5 H749.5";

function glyph() {
  return `
  <!-- Glow-Unterlage -->
  <circle cx="512" cy="512" r="300" fill="none" stroke="${ACCENT}" stroke-opacity="0.15" stroke-width="70"/>
  <path d="${PULSE}" fill="none" stroke="${ACCENT}" stroke-opacity="0.15" stroke-width="70" stroke-linecap="round" stroke-linejoin="round"/>
  <!-- Chromatic-Ghost (Magenta), leicht versetzt: translate(1 -0.6)*25 = (25 -15) -->
  <g transform="translate(25 -15)" opacity="0.4" fill="none" stroke="${GHOST}" stroke-width="37" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="512" cy="512" r="300"/>
    <path d="${PULSE}"/>
  </g>
  <!-- Front (Akzent): Scope-Ring + Live-Puls -->
  <g fill="none" stroke="${ACCENT}" stroke-width="46" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="512" cy="512" r="300"/>
    <path d="${PULSE}"/>
  </g>
  <!-- Live-Node am Ende der Kurve -->
  <circle cx="749.5" cy="524.5" r="38" fill="${ACCENT}"/>`;
}

function gridLines() {
  let l = "";
  for (let p = 64; p < 1024; p += 64) {
    l += `<line x1="${p}" y1="0" x2="${p}" y2="1024"/><line x1="0" y1="${p}" x2="1024" y2="${p}"/>`;
  }
  return `<g stroke="${ACCENT}" stroke-opacity="0.05" stroke-width="1">${l}</g>`;
}

const background = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="#0d1320"/>
  ${gridLines()}
</svg>`;

const foreground = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${glyph()}</svg>`;

async function run() {
  const bg = await sharp(Buffer.from(background)).png().toBuffer();
  const fg = await sharp(Buffer.from(foreground)).png().toBuffer();

  writeFileSync(join(assets, "icon-background.png"), bg);
  writeFileSync(join(assets, "icon-foreground.png"), fg);

  const iconOnly = await sharp(bg).composite([{ input: fg }]).png().toBuffer();
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
