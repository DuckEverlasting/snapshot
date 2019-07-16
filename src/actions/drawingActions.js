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

export function continueLine(ctx, {dest}) {
  ctx.lineTo(dest[0], dest[1]);
  ctx.stroke();
}

export function drawQuadratic(ctx, {orig, ctrl1, dest, width, color}) {
  ctx.beginPath();
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.moveTo(orig[0], orig[1]);
  ctx.quadraticCurveTo(ctrl1[0], ctrl1[1], dest[0], dest[1]);
  ctx.stroke();
}

export function continueQuadratic(ctx, {ctrl1, dest}) {
  ctx.quadraticCurveTo(ctrl1[0], ctrl1[1], dest[0], dest[1]);
  ctx.stroke();
}

export function drawBezier(ctx, {orig, ctrl1, ctrl2, dest, width, color}) {
  ctx.beginPath();
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.moveTo(orig[0], orig[1]);
  ctx.bezierCurveTo(ctrl1[0], ctrl1[1], ctrl2[0], ctrl2[1], dest[0], dest[1]);
  ctx.stroke();
}

export function continueBezier(ctx, {ctrl1, ctrl2, dest}) {
  ctx.bezierCurveTo(ctrl1[0], ctrl1[1], ctrl2[0], ctrl2[1], dest[0], dest[1]);
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