// Builds the wedding invitation into a standalone static site in dist/.
// The source page (wedding-invitation/index.html) is written as a body fragment
// so it can also be published as a Claude artifact; this wraps it in a full
// HTML document with share-preview tags for WhatsApp and other apps.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync } from "node:fs";

const SRC = "wedding-invitation";
const OUT = "dist";

const body = readFileSync(`${SRC}/index.html`, "utf8");
const title = (body.match(/<title>([^<]*)<\/title>/) || [, "Wedding Invitation"])[1];
const description = "Engagement 28 Nov, Mehendi & Sangeet 29 Nov, Wedding 30 Nov 2026 in Meerut. With best compliments from the Tyagi Family.";

// Vercel sets this at build time; share previews need an absolute image URL.
const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || "";
const base = host ? `https://${host}` : "";

const head = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="${description}">
<meta name="theme-color" content="#5A1123">
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${base}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
${base ? `<meta property="og:url" content="${base}/">\n` : ""}<meta name="twitter:card" content="summary_large_image">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#5A1123"/><circle cx="32" cy="32" r="14" fill="#E8890C"/><circle cx="32" cy="32" r="6" fill="#F6B23C"/></svg>')}">
<style>
  :root { color-scheme: light; padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px); }
  body { margin: 0; font: 14px/1.5 system-ui, sans-serif; }
  img { max-width: 100%; }
  [hidden] { display: none !important; }
</style>
</head>
<body>
`;

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
writeFileSync(`${OUT}/index.html`, head + body + "\n</body>\n</html>\n");
for (const f of ["og.png", "apple-touch-icon.png"]) {
  copyFileSync(`${SRC}/${f}`, `${OUT}/${f}`);
}
console.log(`Built ${OUT}/index.html${base ? ` for ${base}` : ""}`);
