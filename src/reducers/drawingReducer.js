import {
  line,
  quadratic,
  bezier,
  rectangle,
  circle
} from '../actions/ctxActions.js'

export default function(ctx, { action, params }) {
  if (params.clearFirst) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  }
  if (params.filter) {
    ctx.filter = params.filter
  } else {
    ctx.filter = "none"
  }
  if (params.composite) {
    ctx.globalCompositeOperation = params.composite
  } else {
    ctx.globalCompositeOperation = "source-over"
  }
  ctx.beginPath();
  ctx.moveTo(params.orig[0], params.orig[1]);
  if (params.width) ctx.lineWidth = params.width;
  if (params.dashPattern) ctx.setLineDash(params.dashPattern);
  ctx.strokeStyle = params.strokeColor;
  ctx.fillStyle = params.fillColor;

  switch (action) {
    case "drawLine":
      line(ctx, params);
      return ctx.stroke();
      
    case "drawQuad":
      quadratic(ctx, params);
      return ctx.stroke();
    
    case "drawBezier":
      bezier(ctx, params);
      return ctx.stroke();
    
    case "drawLinePath":
      line(ctx, params);
      return ctx.stroke();
    
    case "drawQuadPath":
      quadratic(ctx, params);
      ctx.closePath();
      return ctx.stroke();
    
    case "drawBezierPath":
      bezier(ctx, params);
      ctx.closePath();
      return ctx.stroke();
    
    case "drawRect":
      rectangle(ctx, params);
      return ctx.stroke();
    
    case "drawCircle":
      circle(ctx, params);
      return ctx.stroke();
    
    case "fillLinePath":
      line(ctx, params);
      ctx.closePath();
      return ctx.fill();
    
    case "fillQuadPath":
      quadratic(ctx, params);
      ctx.closePath();
      return ctx.fill();
    
    case "fillBezierPath":
      bezier(ctx, params);
      ctx.closePath();
      return ctx.fill();
    
    case "fillRect":
      rectangle(ctx, params);
      return ctx.fill();
    
    case "fillCircle":
      circle(ctx, params);
      return ctx.fill();

    default:
      return "error: invalid draw action";
  }
}