import pencilImg from "../cursors/pencil.png";
import dropperImg from "../cursors/dropper.png";
import crosshairsImg from "../cursors/crosshairs.png";

export default function getCursor(cursorName, keys) {
  switch (cursorName) {
    case "pencil":
      return `url(${pencilImg}) -22 22, auto`;
    case "line":
      return "crosshair";
    case "fillRect":
      return "crosshair";
    case "drawRect":
      return "crosshair";
    case "selectRect":
      return "crosshair";
    case "selectEllipse":
      return "crosshair";
    case "lasso":
      return "crosshair";
    case "stamp":
      return keys.alt ? `url(${crosshairsImg}) 10 10, auto` : "crosshair";
    case "eyeDropper":
      return `url(${dropperImg}) -22 22, auto`;
    case "move":
      return "move";
    case "hand":
      return "grab";
    case "activeHand":
      return "grabbing";
    case "zoom":
      return keys.alt ? "zoom-out" : "zoom-in";
    default:
      return "auto";
  }
}