import fs from "node:fs";
import path from "node:path";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

// Dynamic import of TS module via relative path won't work without tsx.
// Inline minimal copy of fill logic for test:
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

const FONT_PATH = path.join(process.cwd(), "public", "fonts", "NotoSans-Regular.ttf");
const TEMPLATE_PATH = path.join(
  process.cwd(),
  "public",
  "templates",
  "5.-MauGiaPha-So-05.BHDTU-PDF.pdf",
);

const profile = {
  devotee: {
    family_registry_no: "GĐ-001",
    bhd_registry_no: "BHD-001",
    full_name: "Nguyễn Văn A",
    birth_date: "01/02/1960",
    birth_place: "Huế",
    dharma_name: "Quảng Đức",
    address: "123 Đường Chùa, Quận 1, TP. Hồ Chí Minh",
    joined_unit_date: "15/07/1980",
    vow_date: null,
    refuge_date: "15/07/1980",
    preceptor: "Hòa thượng Thích Thiện Tâm",
    father_name: "Nguyễn Văn B",
    mother_name: "Trần Thị C",
  },
  afterlife: { death_date: "01/01/2020", grave_location: "Nghĩa trang Chùa, Quận 1" },
};

const anchors = {
  familyRegistryNo: { pageIndex: 0, x: 241, y: 737.2, fontSize: 10, maxWidth: 110 },
  fullName: { pageIndex: 0, x: 224.3, y: 695.7, fontSize: 10, maxWidth: 370 },
  address: { pageIndex: 0, x: 224.3, y: 632.9, fontSize: 10, maxWidth: 370 },
  preceptor: { pageIndex: 0, x: 224.3, y: 570.2, fontSize: 10, maxWidth: 370 },
  deathDate: { pageIndex: 1, x: 224.3, y: 116.1, fontSize: 10, maxWidth: 370 },
};

const values = {
  familyRegistryNo: profile.devotee.family_registry_no,
  fullName: profile.devotee.full_name,
  address: profile.devotee.address,
  preceptor: profile.devotee.preceptor,
  deathDate: profile.afterlife.death_date,
};

async function fill(subset, normalize, useMaxWidth) {
  const pdf = await PDFDocument.load(fs.readFileSync(TEMPLATE_PATH));
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(fs.readFileSync(FONT_PATH), { subset });
  const pages = pdf.getPages();

  for (const [key, anchor] of Object.entries(anchors)) {
    let text = values[key];
    if (normalize) text = text.normalize("NFC");
    const opts = {
      x: anchor.x,
      y: anchor.y,
      size: anchor.fontSize,
      font,
      color: rgb(0, 0, 0),
    };
    if (useMaxWidth) opts.maxWidth = anchor.maxWidth;
    pages[anchor.pageIndex].drawText(text, opts);
  }

  const out = path.join(
    process.cwd(),
    "tmp",
    `fill-sample-subset-${subset}-nfc-${normalize}-mw-${useMaxWidth}.pdf`,
  );
  fs.writeFileSync(out, await pdf.save({ useObjectStreams: false }));

  const doc = await getDocument({ data: new Uint8Array(fs.readFileSync(out)) }).promise;
  const texts = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const tc = await (await doc.getPage(p)).getTextContent();
    texts.push(...tc.items.map((i) => i.str));
  }
  console.log(path.basename(out), "=>", texts.filter((t) => t.trim()).join(" | "));
}

await fill(true, false, true);
await fill(true, true, true);
await fill(false, true, false);
await fill(true, true, false);
