export function line(ctx, { destArray, translation }) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (translation) ctx.translate(translation, translation);
  destArray.forEach(dest => {
    ctx.lineTo(dest[0], dest[1]);
  });
  if (translation) ctx.translate(-translation, -translation);
}

export function quadratic(ctx, { destArray }) {
  destArray.forEach(dest => {
    ctx.quadraticCurveTo(dest[0], dest[1], dest[2], dest[3]);
  });
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
  ctx.drawImage(sourceCtx.canvas, dest[0], dest[1]);
  if (clip) {
    ctx.restore();
  }
}

export function replace(ctx, { source }) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
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
  let counter = 0;

  while (stack.length) {
    counter++;
    current = stack.pop();
    // console.log(stack)
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
    // console.log([data[pixel], data[pixel + 1], data[pixel + 2], data[pixel + 3]])
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
