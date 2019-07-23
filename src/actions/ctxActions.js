export function line(ctx, { destArray }) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  destArray.forEach(dest => {
    ctx.lineTo(dest[0], dest[1]);
  })
}

export function quadratic(ctx, { destArray }) {
  destArray.forEach(dest => {
    ctx.quadraticCurveTo(dest[0], dest[1], dest[2], dest[3]);
  })
}

export function bezier(ctx, { destArray }) {
  destArray.forEach(dest => {
    ctx.bezierCurveTo(dest[0], dest[1], dest[2], dest[3], dest[4], dest[5]);
  })
}

export function rectangle(ctx, { orig, dest }) {
  ctx.rect(orig[0], orig[1], (dest[0] - orig[0]), (dest[1] - orig[1]))
}

export function circle(ctx, { orig, radius }) {
  ctx.arc(orig[0], orig[1], radius, 0, Math.PI * 2);
}

export function move(ctx, { orig, dest }) {
  let [x, y] = [dest[0] - orig[0], dest[1] - orig[1]]
  const data = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.putImageData(data, x, y);  
}