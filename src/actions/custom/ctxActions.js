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

export function line(ctx, { destArray, translation }) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (translation) ctx.translate(translation, translation);
  destArray.forEach(dest => {
    if (dest.newStroke) {
      ctx.moveTo(dest.x, dest.y)  
    } else {
      ctx.lineTo(dest.x, dest.y);
    }
  });
  if (translation) ctx.translate(-translation, -translation);
}

export function quadratic(ctx, { orig, destArray, translation }) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (translation) ctx.translate(translation, translation);
  const firstMid = midpoint(orig, destArray[0]);
  ctx.lineTo(firstMid.x, firstMid.y);
  destArray.forEach((dest, i) => {
    if (destArray.newStroke) {
      ctx.moveTo(dest.x, dest.y)  
    } else {
      if (i < destArray.length - 1) {
        const mid = midpoint(dest, destArray[i + 1]);
        ctx.quadraticCurveTo(dest.x, dest.y, mid.x, mid.y);
      } else {
        ctx.lineTo(dest.x, dest.y);
      }
    }
  });
  if (translation) ctx.translate(-translation, -translation);
}

export function quadraticPoints(ctx, { destArray, width, gradient, density = .25, translation }) {
  // density in this case = percentage of width between each point
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (translation) ctx.translate(translation, translation);
  const numOfPoints = getQuadLength(destArray[0], destArray[1], destArray[2]) / (density * width);
  getPointsAlongQuad(destArray[0], destArray[1], destArray[2], numOfPoints).forEach(point => {
    ctx.beginPath();
    let grad = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, width / 2);
    gradient.forEach(data => {
      grad.addColorStop(data[0], data[1]);
    })
    ctx.fillStyle = grad;
    ctx.arc(point.x, point.y, width / 2, 0,Math.PI * 2);
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

export function paste(ctx, { sourceCtx, dest }) {
  ctx.drawImage(sourceCtx.canvas, Math.floor(dest.x), Math.floor(dest.y));
}

export function undelete(ctx, { source }) {
  ctx.putImageData(source, 0, 0);
}

export function fill(ctx, { orig, colorArray, tolerance = 100 }) {
  const viewWidth = Math.ceil(ctx.canvas.width);
  const viewHeight = Math.ceil(ctx.canvas.height);
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
    if (colorMatch(current)) {
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

export function getDiff(ctx, { prevImgData }) {
  const viewWidth = Math.ceil(ctx.canvas.width);
  const viewHeight = Math.ceil(ctx.canvas.height);
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
  const viewWidth = Math.ceil(ctx.canvas.width);
  const viewHeight = Math.ceil(ctx.canvas.height);
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
