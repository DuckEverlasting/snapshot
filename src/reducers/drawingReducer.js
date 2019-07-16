import {
  drawCircle,
  drawLine,
  continueLine,
  drawQuadratic,
  continueQuadratic,
  drawBezier,
  continueBezier,
  drawRect,
  fillRect
} from '../actions/drawingActions.js'

export default function(ctx, {action, params}) {
  switch (action) {
    case "drawCircle":
      return drawCircle(ctx, params);
    case "drawLine":
      return drawLine(ctx, params);
    case "continueLine":
      return continueLine(ctx, params);
    case "drawQuadratic":
      return drawQuadratic(ctx, params);
    case "continueQuadratic":
      return continueQuadratic(ctx, params);
    case "drawBezier":
        return drawBezier(ctx, params);
    case "continueBezier":
      return continueBezier(ctx, params);
    case "drawRect":
      return drawRect(ctx, params);
    case "fillRect":
      return fillRect(ctx, params);
    default:
      return "error: invalid draw action"
  }
}