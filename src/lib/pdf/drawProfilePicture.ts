import {
  clip,
  endPath,
  popGraphicsState,
  pushGraphicsState,
  rectangle,
  type PDFImage,
  type PDFPage,
} from "pdf-lib";

import type { MauGiaPhaImageAnchor } from "./pdfFieldMap";

type DrawProfilePictureOptions = {
  page: PDFPage;
  image: PDFImage;
  anchor: MauGiaPhaImageAnchor;
};

/**
 * Draw profile picture with object-fit: cover inside the anchor rectangle.
 */
export function drawProfilePictureCover({ page, image, anchor }: DrawProfilePictureOptions) {
  const imgWidth = image.width;
  const imgHeight = image.height;
  const scale = Math.max(anchor.width / imgWidth, anchor.height / imgHeight);
  const drawWidth = imgWidth * scale;
  const drawHeight = imgHeight * scale;
  const drawX = anchor.x + (anchor.width - drawWidth) / 2;
  const drawY = anchor.y + (anchor.height - drawHeight) / 2;

  page.pushOperators(
    pushGraphicsState(),
    rectangle(anchor.x, anchor.y, anchor.width, anchor.height),
    clip(),
    endPath(),
  );

  page.drawImage(image, {
    x: drawX,
    y: drawY,
    width: drawWidth,
    height: drawHeight,
  });

  page.pushOperators(popGraphicsState());
}
