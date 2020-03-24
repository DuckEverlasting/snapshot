import { midpoint, getQuadLength } from "../../utils/helpers";

function getPointInQuad(p1, p2, p3, t) {
  return [0, 1].map(
    num =>
      (1 - t) * (1 - t) * p1[num] + 2 * (1 - t) * t * p2[num] + t * t * p3[num]
  );
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
    ctx.lineTo(dest[0], dest[1]);
  });
  if (translation) ctx.translate(-translation, -translation);
}

export function quadratic(ctx, { orig, destArray, translation }) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (translation) ctx.translate(translation, translation);
  const firstMid = midpoint(orig, destArray[0]);
  ctx.lineTo(firstMid[0], firstMid[1]);
  destArray.forEach((dest, i) => {
    if (i < destArray.length - 1) {
      const mid = midpoint(dest, destArray[i + 1]);
      ctx.quadraticCurveTo(dest[0], dest[1], mid[0], mid[1]);
    } else {
      ctx.lineTo(dest[0], dest[1]);
    }
  });
  if (translation) ctx.translate(-translation, -translation);
}

export function quadraticPoints(ctx, { orig, destArray, width, gradient, density = .25, translation }) {
  // density in this case = percentage of width between each point
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (translation) ctx.translate(translation, translation);
  const numOfPoints = getQuadLength(orig, destArray[0], destArray[1]) / (density * width);
  getPointsAlongQuad(orig, destArray[0], destArray[1], numOfPoints).forEach(point => {
    ctx.beginPath();
    let grad = ctx.createRadialGradient(point[0], point[1], 0, point[0], point[1], width / 2);
    gradient.forEach(data => {
      grad.addColorStop(data[0], data[1]);
    })
    ctx.fillStyle = grad;
    ctx.arc(point[0], point[1], width / 2, 0,Math.PI * 2);
    ctx.fill();
  })
  if (translation) ctx.translate(-translation, -translation);
}

export function bezier(ctx, { destArray }) {
  destArray.forEach(dest => {
    ctx.bezierCurveTo(dest[0], dest[1], dest[2], dest[3], dest[4], dest[5]);
  });
}

export function rectangle(ctx, { orig, dest, translation }) {
  if (translation) ctx.translate(translation, translation);
  ctx.rect(orig[0], orig[1], dest[0] - orig[0], dest[1] - orig[1]);
  if (translation) ctx.translate(-translation, -translation);
}

export function circle(ctx, { orig, dest }) {
  ctx.beginPath();
  ctx.arc(
    orig[0],
    orig[1],
    Math.sqrt(
      (dest[0] - orig[0]) * (dest[0] - orig[0]) +
        (dest[1] - orig[1]) * (dest[1] - orig[1])
    ),
    0,
    Math.PI * 2
  );
}

export function move(ctx, { orig, dest }) {
  let [x, y] = [dest[0] - orig[0], dest[1] - orig[1]];
  console.log(ctx)
  const data = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.putImageData(data, x, y);
}

export function paste(ctx, { sourceCtx, dest }) {
  ctx.drawImage(sourceCtx.canvas, Math.floor(dest[0]), Math.floor(dest[1]));
}

export function undelete(ctx, { source }) {
  ctx.putImageData(source, 0, 0);
}

export function fill(ctx, { orig, colorArray, tolerance = 100 }) {
  const viewWidth = Math.ceil(ctx.canvas.width / 3);
  const viewHeight = Math.ceil(ctx.canvas.height / 3);
  orig[0] -= viewWidth;
  orig[1] -= viewHeight;
  orig = orig.map(num => Math.floor(num));
  const imgData = ctx.getImageData(
    viewWidth,
    viewHeight,
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

  ctx.clearRect(viewWidth, viewHeight, viewWidth, viewHeight);
  ctx.putImageData(imgData, viewWidth, viewHeight);

  function getSurrounding(origin) {
    return [
      origin + 4,
      origin - 4,
      origin - viewWidth * 4,
      origin + viewWidth * 4
    ];
  }

  function getPixelAt(origin) {
    return (origin[0] + origin[1] * viewWidth) * 4;
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
  const viewWidth = Math.ceil(ctx.canvas.width / 3);
  const viewHeight = Math.ceil(ctx.canvas.height / 3);
  const imgData = ctx.getImageData(
    viewWidth,
    viewHeight,
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
  const viewWidth = Math.ceil(ctx.canvas.width / 3);
  const viewHeight = Math.ceil(ctx.canvas.height / 3);
  const imgData = ctx.getImageData(
    viewWidth,
    viewHeight,
    viewWidth,
    viewHeight
  );
  for (let index in changeData) {
    let placeholder = imgData.data[index];
    imgData.data[index] = changeData[index];
    changeData[index] = placeholder;
  }
  ctx.putImageData(imgData, viewWidth, viewHeight);
  return changeData;
}
