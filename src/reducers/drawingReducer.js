import {
  drawCircle,
  drawLine,
  drawRect,
  fillRect
} from '../actions/drawingActions.js'

export default function(ctx, {action, params}) {
  switch (action) {
    case "drawCircle":
      return drawCircle(ctx, params);
    case "drawLine":
      return drawLine(ctx, params);
    case "drawRect":
      return drawRect(ctx, params);
    case "fillRect":
      return fillRect(ctx, params);
    default:
      return "error: invalid draw action"
  }
}