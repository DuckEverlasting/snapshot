import {
  move
} from '../../actions/custom/ctxActions.js'

export default function(ctx, { action, params }) {
  switch (action) {
    case "move":
      return move(ctx, params);
    default:
      return "error: invalid draw action";
  }
}