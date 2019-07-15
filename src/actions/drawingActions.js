export function drawCircle(ctx, {center, radius, color}) {
  ctx.beginPath();
  ctx.arc(center[0], center[1], radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

export function drawLine(ctx, {orig, dest, width, color}) {
  ctx.beginPath();
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.moveTo(orig[0], orig[1]);
  ctx.lineTo(dest[0], dest[1]);
  ctx.stroke();
}

export function drawRect(ctx, {orig, dest, width, color}) {
  ctx.beginPath();
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.rect(orig[0], orig[1], (dest[0] - orig[0]), (dest[1] - orig[1]))
  ctx.stroke();
}

export function fillRect(ctx, {orig, dest, width, color}) {
  ctx.beginPath();
  ctx.lineWidth = width;
  ctx.fillStyle = color;
  ctx.rect(orig[0], orig[1], (dest[0] - orig[0]), (dest[1] - orig[1]))
  ctx.fill();
}
