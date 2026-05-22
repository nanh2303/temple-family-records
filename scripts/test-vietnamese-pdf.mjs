import fs from "node:fs";
import path from "node:path";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

const FONT_PATH = path.join(process.cwd(), "public", "fonts", "NotoSans-Regular.ttf");

const longName =
  "Nguyễn Thị Hồng Hà Phương Anh Minh Châu Thảo Vy Lan Chi";
const nfc = "Nguyễn Văn An";
const nfd = nfc.normalize("NFD");

async function testCase(name, options) {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(fs.readFileSync(FONT_PATH), {
    subset: options.subset ?? true,
  });
  const page = pdf.addPage([612, 200]);
  page.drawText(name, { x: 20, y: 180, size: 8, font, color: rgb(0.5, 0, 0) });
  page.drawText(options.text, {
    x: 20,
    y: 150,
    size: 10,
    font,
    maxWidth: options.maxWidth,
    lineHeight: 12,
  });
  const out = path.join(process.cwd(), "tmp", `vietnamese-${name}.pdf`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, await pdf.save());
  console.log("wrote", out);
}

await testCase("no-maxwidth", { text: longName, subset: true });
await testCase("maxwidth-370", { text: longName, subset: true, maxWidth: 370 });
await testCase("nfc", { text: nfc, subset: true, maxWidth: 370 });
await testCase("nfd", { text: nfd, subset: true, maxWidth: 370 });
await testCase("no-subset-maxwidth", {
  text: longName,
  subset: false,
  maxWidth: 370,
});
