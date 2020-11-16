// export function wrap() {
//   const self = d3.select(this);
//   let textLength: number = self.node().getComputedTextLength();
//   let text: string = self.text();
//   while (textLength > CELL_TEXT_WIDTH && text.length > 0) {
//     text = text.slice(0, -1);
//     self.text(text + "...");
//     textLength = self.node().getComputedTextLength();
//   }
// }

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
  while (width > textWidth && txt.length > 6) {
    if (!ellipsised) {
      ellipsised = true;
      txt = txt.slice(0, -3);
      width = getTextWidth(`${txt}...`, font); // take 3 chars out, since we will add 3 ellipsis
    } else {
      txt = txt.slice(0, -1);
      width = getTextWidth(`${txt}...`, font);
    }
  }
  return ellipsised ? `${txt}...` : txt;
}
