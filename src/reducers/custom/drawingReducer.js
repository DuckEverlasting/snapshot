import {
  line,
  quadratic,
  quadraticPoints,
  rectangle,
  ellipse
} from "../../actions/custom/ctxActions.js";

export default function(ctx, { action, params }) {
  if (action === "clear") {
    return ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  if (params.clearFirst) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
  
  ctx.save();

  if (params.filter) {
    ctx.filter = params.filter;
  }
  if (params.globalAlpha) {
    ctx.globalAlpha = params.globalAlpha;
  }
  if (params.composite) {
    ctx.globalCompositeOperation = params.composite;
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
  if (params.dashOffset) {
    ctx.lineDashOffset = params.dashOffset;
  } else {
    ctx.lineDashOffset = 0;
  }
  ctx.moveTo(Math.floor(params.orig.x), Math.floor(params.orig.y));
  ctx.strokeStyle = params.strokeColor;
  ctx.fillStyle = params.fillColor;
  if (params.clip) {
    if (params.clipOffset) {
      ctx.translate(Math.floor(-params.clipOffset.x), Math.floor(-params.clipOffset.y))
    }
    ctx.clip(params.clip);
    if (params.clipOffset) {
      ctx.translate(Math.floor(params.clipOffset.x), Math.floor(params.clipOffset.y))
    }
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

    case "drawRect":
      rectangle(ctx, params);
      ctx.stroke();
      break;

    case "drawEllipse":
      ellipse(ctx, params);
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

    case "fillRect":
      rectangle(ctx, params);
      ctx.fill();
      break;

    case "fillEllipse":
      ellipse(ctx, params);
      ctx.fill();
      break;

    case "null":
      break;

    default:
      console.log("error: invalid draw action");
      break;
  }
  
  ctx.restore();
}
