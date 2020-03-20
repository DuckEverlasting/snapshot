function midpoint(orig, dest) {
  return [orig[0] + (dest[0] - orig[0]) / 2, orig[1] + (dest[1] - orig[1]) / 2];  
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
  ctx.quadraticCurveTo(orig[0], orig[1], firstMid[0], firstMid[1]);
  destArray.forEach((dest, i) => {
    if (i < destArray.length - 1) {
      const mid = midpoint(dest, destArray[i + 1])
      ctx.quadraticCurveTo(dest[0], dest[1], mid[0], mid[1]);
    } else {
      ctx.lineTo(dest[0], dest[1]);
    }
  });
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
  const data = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.putImageData(data, x, y);
}

export function paste(ctx, { sourceCtx, dest, clip, clearFirst = false }) {
  if (clearFirst) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
  if (clip) {
    ctx.save();
    ctx.clip(clip);
  }
  ctx.drawImage(sourceCtx.canvas, Math.floor(dest[0]), Math.floor(dest[1]));
  if (clip) {
    ctx.restore();
  }
}

export function undelete(ctx, { source }) {
  ctx.putImageData(source, 0, 0);
}

export function fill(ctx, { orig, colorArray, clip, tolerance = 100 }) {
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
    if (colorMatch(current) && pointInPath(current)) {
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

  function colorMatch(index) {
    if (index < 0 || index + 4 - 1 > data.length) {
      return false;
    }
    let diff = 0;
    for (let i = 0; i < 4; i++) {
      diff += Math.abs(data[index + i] - originColor[i]);
    }
    return diff <= tolerance;
  }

  function pointInPath(index) {
    const x = ((index / 4) % viewWidth) + viewWidth;
    const y = Math.floor((index / 4) / viewWidth) + viewHeight;
    return ctx.isPointInPath(clip, x, y);
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
  const diff = {}
  imgData.data.forEach((datum, index) => {
    if (datum !== prevImgData.data[index]) {
      diff[index] = prevImgData.data[index]
    }
  })
  return diff
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
  };
  ctx.putImageData(imgData, viewWidth, viewHeight);
  return changeData;
}
