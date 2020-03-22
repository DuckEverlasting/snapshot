import {
  line,
  quadratic,
  quadraticPoints,
  bezier,
  rectangle,
  circle
} from "../../actions/custom/ctxActions.js";

export default function(ctx, { action, params }) {
  if (action === "clear") {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    return;
  }

  if (params.clearFirst) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
  if (params.filter) {
    ctx.filter = params.filter;
  } else {
    ctx.filter = "none";
  }
  if (params.composite) {
    ctx.globalCompositeOperation = params.composite;
  } else {
    ctx.globalCompositeOperation = "source-over";
  }
  ctx.beginPath();
  if (params.width) {
    params.translation = (params.width % 2) / 2;
    ctx.lineWidth = params.width;
  }
  if (params.dashPattern) {
    ctx.setLineDash(params.dashPattern);
  } else {
    ctx.setLineDash([]);
  }
  ctx.moveTo(params.orig[0], params.orig[1]);
  ctx.strokeStyle = params.strokeColor;
  ctx.fillStyle = params.fillColor;
  if (params.clip) {
    ctx.save();
    ctx.clip(params.clip);
  }

  switch (action) {
    case "drawLine":
      line(ctx, params);
      ctx.stroke();
      break;

    case "drawQuad":
      quadratic(ctx, params);
      ctx.stroke();
      break;

    case "drawBezier":
      bezier(ctx, params);
      ctx.stroke();
      break;

    case "drawQuadPoints":
      quadraticPoints(ctx, params);
      break;

    case "drawLinePath":
      line(ctx, params);
      ctx.closePath();
      ctx.stroke();
      break;

    case "drawQuadPath":
      quadratic(ctx, params);
      ctx.closePath();
      ctx.stroke();
      break;

    case "drawBezierPath":
      bezier(ctx, params);
      ctx.closePath();
      ctx.stroke();
      break;

    case "drawRect":
      rectangle(ctx, params);
      ctx.stroke();
      break;

    case "drawCirc":
      circle(ctx, params);
      ctx.stroke();
      break;

    case "fillLinePath":
      line(ctx, params);
      ctx.closePath();
      ctx.fill();
      break;

    case "fillQuadPath":
      quadratic(ctx, params);
      ctx.closePath();
      ctx.fill();
      break;

    case "fillBezierPath":
      bezier(ctx, params);
      ctx.closePath();
      ctx.fill();
      break;

    case "fillRect":
      rectangle(ctx, params);
      ctx.fill();
      break;

    case "fillCirc":
      circle(ctx, params);
      ctx.fill();
      break;

    case "null":
      break;

    default:
      return "error: invalid draw action";
  }
  if (params.clip) {
    ctx.restore();
  }
}
