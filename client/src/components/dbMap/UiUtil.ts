let CANVAS: HTMLCanvasElement;
let CANVAS_CTX: any;
function getTextWidth(text: string, font: string) {
  if (!CANVAS_CTX) {
    CANVAS = document.createElement("canvas"); // Not visible on UI, which is good
    CANVAS_CTX = CANVAS.getContext("2d");
  }
  CANVAS_CTX.font = font;
  const metrics = CANVAS_CTX.measureText(text);
  return metrics.width;
}

/** This is about 8 times faster than the approach of self.node().getComputedTextLength() */
export function wrapText(text, font: string, textWidth: number): string {
  let txt = text;
  let width = getTextWidth(txt, font);
  let ellipsised = false;
  if (width > textWidth && txt.length > 6) {
    ellipsised = true;
    txt = txt.slice(0, -3);
    width = getTextWidth(`${txt}...`, font); // take 3 chars out, since we will add 3 ellipsis

    while (width > textWidth && txt.length > 6) {
      txt = txt.slice(0, -1);
      width = getTextWidth(`${txt}...`, font);
    }
  }
  return ellipsised ? `${txt}...` : txt;
}
