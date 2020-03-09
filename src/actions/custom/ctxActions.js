export function line(ctx, { destArray, translation }) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (translation) ctx.translate(translation, translation);
  destArray.forEach(dest => {
    ctx.lineTo(dest[0], dest[1]);
  })
  if (translation) ctx.translate(-translation, -translation);
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

export function rectangle(ctx, { orig, dest, translation }) {
  if (translation) ctx.translate(translation, translation);
  ctx.rect(orig[0], orig[1], (dest[0] - orig[0]), (dest[1] - orig[1]))
  if (translation) ctx.translate(-translation, -translation);
}

export function circle(ctx, { orig, dest }) {
  ctx.beginPath();
  ctx.arc(orig[0], orig[1], Math.sqrt(((dest[0] - orig[0]) * (dest[0] - orig[0])) + ((dest[1] - orig[1]) * (dest[1] - orig[1]))), 0, Math.PI * 2);
}

export function move(ctx, { orig, dest }) {
  let [x, y] = [dest[0] - orig[0], dest[1] - orig[1]]
  const data = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.putImageData(data, x, y);  
}

export function paste(ctx, { sourceCtx, dest, clip, clearFirst=false }) {
  if (clearFirst) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  }
  if (clip) {
    ctx.save()
    ctx.clip(clip)
  }
  ctx.drawImage(sourceCtx.canvas, dest[0], dest[1]);
  if (clip) {
    ctx.restore()
  }
}
