import {
  move,
  paste,
  undelete,
  fill,
  getDiff,
  swapData
} from '../../actions/custom/ctxActions.js'

export default function(ctx, { action, params }) {
  switch (action) {
    case "move":
      move(ctx, params);
      break;
    case "paste":
      paste(ctx, params);
      break;
    case "undelete":
      undelete(ctx, params);
      break;
    case "fill":
      fill(ctx, params);
      break;
    case "getDiff":
      return getDiff(ctx, params);
    case "swapData":
      return swapData(ctx, params);
    default:
      return "error: invalid draw action";
  }
}