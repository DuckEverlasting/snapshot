import {
  move
} from '../actions/ctxActions.js'

export default function(ctx, { action, params }) {
  switch (action) {
    case "move":
      return move(ctx, params);
    default:
      return "error: invalid draw action";
  }
}