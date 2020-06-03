import { midpoint, getQuadLength } from "../../utils/helpers";

function getPointInQuad(p1, p2, p3, t) {
  const x = (1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * p2.x + t * t * p3.x 
  const y = (1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * p2.y + t * t * p3.y 

  return {x, y}
}

function getPointsAlongQuad(p1, p2, p3, numOfPoints) {
  const points = [];
  const integer = Math.floor(numOfPoints)
  for (let i = 0; i < numOfPoints; i++) {
    const t = i / integer;
    points.push(getPointInQuad(p1, p2, p3, t));
  }
  return points;
}

export function line(ctx, { orig, dest, destArray, translation }) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (translation) ctx.translate(translation, translation);
  if (!destArray) {
    destArray = [orig, dest]
  }
  destArray.forEach(dest => {
    if (dest.newStroke) {
      ctx.moveTo(dest.x, dest.y)  
    } else {
      ctx.lineTo(dest.x, dest.y);
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
      ctx.quadraticCurveTo(dest.x, dest.y, mid.x, mid.y);
    } else {
      ctx.lineTo(dest.x, dest.y);
    }
  });
  if (translation) ctx.translate(-translation, -translation);
}

export function quadraticPoints(ctx, { destArray, width, gradient, hardness=100, density = .25, translation }) {
  // density in this case = percentage of width between each point
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (translation) ctx.translate(translation, translation);
  const numOfPoints = getQuadLength(destArray[0], destArray[1], destArray[2]) / (density * width);
  getPointsAlongQuad(destArray[0], destArray[1], destArray[2], numOfPoints).forEach(point => {
    ctx.beginPath();
    let grad = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, width * (2 - hardness / 100) / 2);
    gradient.forEach(data => {
      grad.addColorStop(data[0], data[1]);
    })
    ctx.fillStyle = grad;
    ctx.arc(point.x, point.y, (width * (2 - hardness / 100)) / 2, 0,Math.PI * 2);
    ctx.fill();
  })
  if (translation) ctx.translate(-translation, -translation);
}

export function rectangle(ctx, { orig, dest, translation }) {
  if (translation) ctx.translate(translation, translation);
  ctx.rect(orig.x, orig.y, dest.x - orig.x, dest.y - orig.y);
  if (translation) ctx.translate(-translation, -translation);
}

export function circle(ctx, { orig, dest }) {
  ctx.beginPath();
  ctx.arc(
    orig.x,
    orig.y,
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
  ctx.ellipse(center.x, center.y, radiusX, radiusY, 0, 0, Math.PI * 2);
}

export function move(ctx, { orig, dest }) {
  let [x, y] = [dest.x - orig.x, dest.y - orig.y];
  const data = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.putImageData(data, x, y);
}

export function paste(ctx, { sourceCtx, orig={x:0,y:0}, dest={x:0,y:0}, size={w: sourceCtx.canvas.width, h: sourceCtx.canvas.height}, anchorPoint={x:0,y:0}, rotation=0 }) {
  ctx.save();
  
  const zoom = {x: size.w / sourceCtx.canvas.width, y: size.h / sourceCtx.canvas.height}
  ctx.translate((zoom.x * sourceCtx.canvas.width * anchorPoint.x + dest.x), (zoom.y * sourceCtx.canvas.height * anchorPoint.y + dest.y));
  ctx.rotate(rotation);
  ctx.translate(-(zoom.x * sourceCtx.canvas.width * anchorPoint.x + dest.x), -(zoom.y * sourceCtx.canvas.height * anchorPoint.y + dest.y));

  ctx.drawImage(sourceCtx.canvas, orig.x, orig.y, sourceCtx.canvas.width, sourceCtx.canvas.height, Math.floor(dest.x), Math.floor(dest.y), size.w, size.h)
  ctx.restore();
}

export function undelete(ctx, { source }) {
  ctx.putImageData(source, 0, 0);
}

export function fill(ctx, { orig, colorArray, tolerance = 100, clip }) {
  const viewWidth = Math.floor(ctx.canvas.width);
  const viewHeight = Math.floor(ctx.canvas.height);
  orig = {x: Math.floor(orig.x), y: Math.floor(orig.y)};
  const imgData = ctx.getImageData(
    0,
    0,
    viewWidth,
    viewHeight
  );
  const { data } = imgData;
  const originIndex = getPixelAt(orig);
  const originColor = [
    data[originIndex],
    data[originIndex + 1],
    data[originIndex + 2],
    data[originIndex + 3]
  ];
  const stack = [originIndex];
  let current;
  let visited = new Set();
  visited.add(originIndex);

  while (stack.length) {
    current = stack.pop();
    const { x, y } = getCoordsOf(current);
    if (colorMatch(current) && (ctx.isPointInPath(clip, x, y))) {
      for (let i = 0; i < 4; i++) {
        data[current + i] = colorArray[i];
      }
      getSurrounding(current).forEach(el => {
        if (!visited.has(el)) {
          stack.push(el);
          visited.add(el);
        }
      });
    }
  }

  ctx.clearRect(0, 0, viewWidth, viewHeight);
  ctx.putImageData(imgData, 0, 0);

  function getSurrounding(origin) {
    return [
      origin + 4,
      origin - 4,
      origin - viewWidth * 4,
      origin + viewWidth * 4
    ];
  }

  function getPixelAt(origin) {
    return (origin.x + origin.y * viewWidth) * 4;
  }

  function getCoordsOf(num) {
    num /= 4;
    return {
      x: num % viewWidth,
      y: Math.floor(num / viewWidth)
    }
  }

  function colorMatch(pixel) {
    if (pixel < 0 || pixel + 4 - 1 > data.length) {
      return false;
    }
    let diff = 0;
    for (let i = 0; i < 4; i++) {
      diff += Math.abs(data[pixel + i] - originColor[i]);
    }
    return diff <= tolerance;
  }
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
