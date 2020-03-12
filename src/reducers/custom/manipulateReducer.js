import {
  move,
  paste,
  replace,
  fill
} from '../../actions/custom/ctxActions.js'

export default function(ctx, { action, params }) {
  switch (action) {
    case "move":
      move(ctx, params);
      break;
    case "paste":
      paste(ctx, params);
      break;
    case "replace":
      replace(ctx, params);
      break;
    case "fill":
      fill(ctx, params);
      break;
    default:
      return "error: invalid draw action";
  }
}