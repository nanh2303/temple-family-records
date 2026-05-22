/**
 * Lists text items (labels and dotted lines) with PDF coordinates.
 * Run: npm run pdf:inspect-template
 * Requires: npm install -D pdfjs-dist
 */
import fs from "node:fs";
import path from "node:path";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const templatePath = path.join(
  process.cwd(),
  "public",
  "templates",
  "5.-MauGiaPha-So-05.BHDTU-PDF.pdf",
);

const data = new Uint8Array(fs.readFileSync(templatePath));
const pdf = await getDocument({ data, useSystemFonts: true }).promise;

for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
  const page = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale: 1 });
  const textContent = await page.getTextContent();
  console.log(`\n=== Page ${pageNum} (${viewport.width} x ${viewport.height}) ===`);

  for (const item of textContent.items) {
    if (!("str" in item) || !item.str.trim()) continue;
    const [a, b, c, d, e, f] = item.transform;
    const x = e;
    const y = f;
    const fontSize = Math.sqrt(a * a + b * b);
    console.log(
      JSON.stringify({
        text: item.str.trim(),
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
        fontSize: Math.round(fontSize * 10) / 10,
      }),
    );
  }
}
