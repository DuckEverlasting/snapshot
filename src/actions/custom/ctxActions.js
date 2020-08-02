import { midpoint, getQuadLength, getDistance } from "../../utils/helpers";

function floor(vector) {
  return {
    x: Math.floor(vector.x),
    y: Math.floor(vector.y),
  }
}

function getPointInQuad(p1, p2, p3, t) {
  const x = (1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * p2.x + t * t * p3.x 
  const y = (1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * p2.y + t * t * p3.y 

  return {x, y}
}

function getPointsAlongQuad(p1, p2, p3, densityFactor) {
  const roughLength = getQuadLength(p1, p2, p3),
    points = [p1],
    arcLengths = [0],
    lengths = roughLength / densityFactor * 4 + 1;

  let prev = points[0];
  for (let i = 1; i < lengths; i++) {
    const t = i / lengths;
    const point = getPointInQuad(p1, p2, p3, t);
    arcLengths[i] = (getDistance(prev, point) + arcLengths[i - 1]);
    prev = point;
  }

  const totalLength = arcLengths[arcLengths.length - 1],
    numOfPoints = Math.floor(totalLength / densityFactor),
    step = totalLength / (numOfPoints - 1);

  let prevLengthNum = 0;
  for (let i = 1; i < numOfPoints - 1; i++) {
    let point;
    const targetLength = i * step;
      
    for (let j = prevLengthNum; j < arcLengths.length; j++) {
      if (arcLengths[j] > targetLength) {
        if (targetLength - arcLengths[j - 1] < arcLengths[j] - targetLength) {
          point = getPointInQuad(p1, p2, p3, (j - 1) / lengths);
          prevLengthNum = j - 1;
        } else {
          point = getPointInQuad(p1, p2, p3, j / lengths);
          prevLengthNum = j;
        }
        break;
      }
    }
    points.push(point);
  }
  points.push(p3)
  return points;
}

export function line(ctx, { orig, dest, destArray, translation }) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (translation) ctx.translate(translation, translation);
  if (!destArray) {
    destArray = [floor(orig), floor(dest)]
  }
  destArray.forEach(dest => {
    if (dest.newStroke) {
      ctx.moveTo(Math.floor(dest.x), Math.floor(dest.y))  
    } else {
      ctx.lineTo(Math.floor(dest.x), Math.floor(dest.y));
    }
  });
  if (translation) ctx.translate(-translation, -translation);
}

export function quadratic(ctx, { destArray, translation }) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (translation) ctx.translate(translation, translation);
  destArray.forEach((dest, i) => {
    if (i < destArray.length - 1) {
      const mid = midpoint(dest, destArray[i + 1]);
      ctx.quadraticCurveTo(Math.floor(dest.x), Math.floor(dest.y), Math.floor(mid.x), Math.floor(mid.y));
    } else {
      ctx.lineTo(Math.floor(dest.x), Math.floor(dest.y));
    }
  });
  if (translation) ctx.translate(-translation, -translation);
}

export function quadraticPoints(ctx, { destArray, width, brushHead, density=.25 }) {
  // density in this case = percentage of width between each point
  // no translation for this one - it's specifically made to offset path drawing tools that this action does not use
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  getPointsAlongQuad(destArray[0], destArray[1], destArray[2], density * width).forEach(point => {
    ctx.drawImage(brushHead, Math.floor(point.x - .5 * brushHead.width), Math.floor(point.y - .5 * brushHead.height));
  })
}

export function rectangle(ctx, { orig, dest, translation }) {
  if (translation) ctx.translate(translation, translation);
  ctx.rect(Math.floor(orig.x), Math.floor(orig.y), Math.floor(dest.x - orig.x), Math.floor(dest.y - orig.y));
  if (translation) ctx.translate(-translation, -translation);
}

export function circle(ctx, { orig, dest }) {
  ctx.beginPath();
  ctx.arc(
    Math.floor(orig.x),
    Math.floor(orig.y),
    Math.sqrt(
      (dest.x - orig.x) * (dest.x - orig.x) +
        (dest.y - orig.y) * (dest.y - orig.y)
    ),
    0,
    Math.PI * 2
  );
}

export function ellipse(ctx, { orig, dest }) {
  ctx.beginPath();
  const center = midpoint(orig, dest);
  const radiusX = Math.abs(dest.x - center.x);
  const radiusY = Math.abs(dest.y - center.y);
  ctx.ellipse(Math.floor(center.x), Math.floor(center.y), radiusX, radiusY, 0, 0, Math.PI * 2);
}

export function move(ctx, { orig, dest }) {
  let [x, y] = [dest.x - orig.x, dest.y - orig.y];
  const data = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.putImageData(data, Math.floor(x), Math.floor(y));
}

export function paste(ctx, { sourceCtx, orig={x:0,y:0}, dest={x:0,y:0}, size={w: sourceCtx.canvas.width, h: sourceCtx.canvas.height}, anchorPoint={x:0,y:0}, rotation=0 }) {
  ctx.save();
  
  const zoom = {x: size.w / sourceCtx.canvas.width, y: size.h / sourceCtx.canvas.height}
  ctx.translate((zoom.x * sourceCtx.canvas.width * anchorPoint.x + dest.x), (zoom.y * sourceCtx.canvas.height * anchorPoint.y + dest.y));
  ctx.rotate(rotation);
  ctx.translate(-(zoom.x * sourceCtx.canvas.width * anchorPoint.x + dest.x), -(zoom.y * sourceCtx.canvas.height * anchorPoint.y + dest.y));

  ctx.drawImage(sourceCtx.canvas, Math.floor(orig.x), Math.floor(orig.y), sourceCtx.canvas.width, sourceCtx.canvas.height, Math.floor(dest.x), Math.floor(dest.y), size.w, size.h)
  ctx.restore();
}

export function undelete(ctx, { source }) {
  ctx.putImageData(source, 0, 0);
}

export function getFillContent(ctx, { orig, colorArray, tolerance, clip, clipOffset }) {
  const canvasWidth = Math.floor(ctx.canvas.width),
    canvasHeight = Math.floor(ctx.canvas.height);
  let pathTest;
  const fillContentCanvas = new OffscreenCanvas(canvasWidth, canvasHeight),
    fillContentCtx = fillContentCanvas.getContext("2d");
  
  orig = {x: Math.floor(orig.x), y: Math.floor(orig.y)};
  
  if (clip) {
    let pathCanvas = new OffscreenCanvas(canvasWidth, canvasHeight),
      pathCtx = pathCanvas.getContext("2d");
    
    if (clipOffset) {
      pathCtx.translate(Math.floor(-clipOffset.x), Math.floor(-clipOffset.y))
    }
    pathCtx.clip(clip);
    if (clipOffset) {
      pathCtx.translate(Math.floor(clipOffset.x), Math.floor(clipOffset.y))
    }
    pathCtx.fillRect(0, 0, canvasWidth, canvasHeight);
    pathTest = pathCtx.getImageData(0,
      0,
      canvasWidth,
      canvasHeight
    ).data;
    pathCanvas = null;
  } else {
    pathTest = null;
  }

  const sourceImgData = ctx.getImageData(
    0,
    0,
    canvasWidth,
    canvasHeight
  ),
    sourceData = sourceImgData.data,
    destImgData = fillContentCtx.getImageData(0, 0, canvasWidth, canvasHeight),
    destData = destImgData.data,
    originIndex = (orig.x + orig.y * canvasWidth) * 4;
  
  fillOperation(sourceData, destData, canvasWidth, pathTest, originIndex, colorArray, tolerance);

  fillContentCtx.putImageData(destImgData, 0, 0);

  return fillContentCanvas
}

function fillOperation(sourceData, destData, canvasWidth, pathTest, originIndex, colorArray, tolerance) {
  let current,
    visited = new Set();
  const originColor = [
    sourceData[originIndex],
    sourceData[originIndex + 1],
    sourceData[originIndex + 2],
    sourceData[originIndex + 3]
  ],
    stack = [originIndex];
  
  visited.add(originIndex);

  while (stack.length) {
    current = stack.pop();
    if (colorMatch(current) && (!pathTest || pathTest[current+3])) {
      for (let i = 0; i < 4; i++) {
        destData[current + i] = colorArray[i];
      }
      getSurrounding(current).forEach(el => {
        if (!visited.has(el)) {
          stack.push(el);
          visited.add(el);
        }
      });
    }
  }

  function getSurrounding(origin) {
    return [
      origin + 4,
      origin - 4,
      origin - canvasWidth * 4,
      origin + canvasWidth * 4
    ];
  }

  function colorMatch(pixel) {
    if (pixel < 0 || pixel + 4 - 1 > sourceData.length) {
      return false;
    }
    let diff = 0;
    for (let i = 0; i < 4; i++) {
      diff += Math.abs(sourceData[pixel + i] - originColor[i]);
    }
    return diff <= tolerance;
  }
}

export function fill(ctx, { orig, colorArray, tolerance = 100, clip, clipOffset }) {
  const fillContentCanvas = getFillContent(ctx, { orig, colorArray, tolerance, clip, clipOffset });
  ctx.drawImage(fillContentCanvas, 0, 0);
}

export function blend(ctx, { source }) {
  const destData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const sourceData = source.getImageData(0, 0, source.canvas.width, source.canvas.height);
  for (let i=0; i<destData.data.length; i+=4) {
    if (sourceData.data[i+3]) {
      const opacity = sourceData.data[i+3] / 255;
      destData.data[i] = sourceData.data[i] * opacity + destData.data[i] * (1 - opacity);
      destData.data[i + 1] = sourceData.data[i + 1] * opacity + destData.data[i + 1] * (1 - opacity);
      destData.data[i + 2] = sourceData.data[i + 2] * opacity + destData.data[i + 2] * (1 - opacity);
    }
  }
  ctx.putImageData(destData, 0, 0);
}

export function getDiff(ctx, { prevImgData }) {
  if (!prevImgData) {
    return {
      old: null,
      new: null
    }
  }
  const viewWidth = Math.floor(ctx.canvas.width);
  const viewHeight = Math.floor(ctx.canvas.height);
  const imgData = ctx.getImageData(
    0,
    0,
    viewWidth,
    viewHeight
  );
  const diff = {
    old: {},
    new: {} 
  };
  imgData.data.forEach((datum, index) => {
    if (datum !== prevImgData.data[index]) {
      diff.old[index] = prevImgData.data[index];
      diff.new[index] = imgData.data[index];
    }
  });
  return diff;
}

export function swapData(ctx, { changeData }) {
  const viewWidth = Math.floor(ctx.canvas.width);
  const viewHeight = Math.floor(ctx.canvas.height);
  const imgData = ctx.getImageData(
    0,
    0,
    viewWidth,
    viewHeight
  );
  for (let index in changeData) {
    let placeholder = imgData.data[index];
    imgData.data[index] = changeData[index];
    changeData[index] = placeholder;
  }
  ctx.putImageData(imgData, 0, 0);
  return changeData;
}
