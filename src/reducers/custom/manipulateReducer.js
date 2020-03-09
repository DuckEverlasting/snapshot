import {
  move,
  paste
} from '../../actions/custom/ctxActions.js'

export default function(ctx, { action, params }) {
  switch (action) {
    case "move":
      move(ctx, params);
      break;
    case "paste":
      paste(ctx, params)
    default:
      return "error: invalid draw action";
  }
}