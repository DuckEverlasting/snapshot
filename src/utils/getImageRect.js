export default function getImageRect(canvas, selectionPath = null, countEmpty = false) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  const imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
  let x, y, i;
  let left, right, top, bottom;

  const inPath = selectionPath ?
    (x, y) => ctx.isPointInPath(selectionPath, x, y) :
    () => true;
  
  const hasData = countEmpty ?
    () => true :
    (i) => imageData.data[i+3] > 0;

  for (y = 0; y < h; y++) {
    let isBlank = true;
    for (x = 0; x < w; x++) {
      i = (y * w + x) * 4;
      if (hasData(i) && inPath(x, y)) {
        isBlank = false;
        break;
      }
    }
    if (!isBlank) {
      top = y;
      break;
    }
  }

  if (top === undefined) {
    return null
  }

  for (x = 0; x < w; x++) {
    let isBlank = true;
    for (y = 0; y < h; y++) {
      i = (y * w + x) * 4;
      if (hasData(i) && inPath(x, y)) {
        isBlank = false;
        break;
      }
    }
    if (!isBlank) {
      left = x;
      break;
    }
  }

  for (y = h-1; y >= 0; y--) {
    let isBlank = true;
    for (x = 0; x < w; x++) {
      i = (y * w + x) * 4;
      if (hasData(i) && inPath(x, y)) {
        isBlank = false;
        break;
      }
    }
    if (!isBlank) {
      bottom = y;
      break;
    }
  }

  for (x = w-1; x >= 0; x--) {
    let isBlank = true;
    for (y = 0; y < h; y++) {
      i = (y * w + x) * 4;
      if (hasData(i) && inPath(x, y)) {
        isBlank = false;
        break;
      }
    }
    if (!isBlank) {
      right = x;
      break;
    }
  }

  return {
    x: left,
    y: top,
    w: right - left + 1,
    h: bottom - top + 1
  }
}