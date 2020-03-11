import {
  move,
  paste,
  fill
} from '../../actions/custom/ctxActions.js'

export default function(ctx, { action, params }) {
  switch (action) {
    case "move":
      move(ctx, params);
      break;
    case "paste":
      paste(ctx, params);
    case "fill":
      fill(ctx, params);
    default:
      return "error: invalid draw action";
  }
}