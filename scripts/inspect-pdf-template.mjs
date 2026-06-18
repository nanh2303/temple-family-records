/**
 * Inspect Mau Gia Pha PDF template: print text anchors and optional debug overlay.
 *
 * Usage:
 *   node scripts/inspect-pdf-template.mjs
 *   node scripts/inspect-pdf-template.mjs --debug-overlay
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PDFDocument, rgb } from "pdf-lib";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const templatePath = path.join(root, "public", "templates", "5.-MauGiaPha-So-05.BHDTU-PDF.pdf");

const PROFILE_PICTURE_ANCHOR = {
  pageIndex: 0,
  x: 482.4,
  y: 635.76,
  width: 57.6,
  height: 72,
};

async function inspectText() {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = new Uint8Array(fs.readFileSync(templatePath));
  const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;
  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale: 1 });
  console.log(`Page size: ${viewport.width} x ${viewport.height} pt`);

  const text = await page.getTextContent();
  const items = text.items
    .filter((item) => item.str?.trim())
    .map((item) => ({
      str: item.str.trim(),
      x: +item.transform[4].toFixed(1),
      y: +item.transform[5].toFixed(1),
    }));

  const leftColumn = items.filter((item) => item.x < 220).sort((a, b) => b.y - a.y);
  console.log("\nLeft column text (x < 220):");
  for (const item of leftColumn) {
    console.log(`  x=${item.x} y=${item.y}  ${item.str}`);
  }

  console.log("\nProfile picture anchor (pdfFieldMap):");
  console.log(`  x=${PROFILE_PICTURE_ANCHOR.x} y=${PROFILE_PICTURE_ANCHOR.y}`);
  console.log(
    `  width=${PROFILE_PICTURE_ANCHOR.width} height=${PROFILE_PICTURE_ANCHOR.height}`,
  );
}

async function writeDebugOverlay() {
  const bytes = fs.readFileSync(templatePath);
  const pdf = await PDFDocument.load(bytes);
  const page = pdf.getPages()[PROFILE_PICTURE_ANCHOR.pageIndex];
  const { x, y, width, height } = PROFILE_PICTURE_ANCHOR;

  page.drawRectangle({
    x,
    y,
    width,
    height,
    borderColor: rgb(1, 0, 0),
    borderWidth: 2,
  });

  page.drawText("photo anchor", {
    x: x + 2,
    y: y + height + 4,
    size: 8,
    color: rgb(1, 0, 0),
  });

  const outPath = path.join(root, "tmp-pdf-photo-anchor-debug.pdf");
  fs.writeFileSync(outPath, await pdf.save());
  console.log(`\nDebug overlay written to ${outPath}`);
}

const debugOverlay = process.argv.includes("--debug-overlay");

await inspectText();
if (debugOverlay) {
  await writeDebugOverlay();
}
