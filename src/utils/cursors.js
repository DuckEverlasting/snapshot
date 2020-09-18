import pencilImg from "../cursors/pencil.png";
import brushImg from "../cursors/brush.png";
import dropperImg from "../cursors/dropper.png";
import crosshairsImg from "../cursors/crosshairs.png";
import smallArrowImg from "../cursors/small_arrow.png";
import smallArrowPlusImg from "../cursors/small_arrow_plus.png";
import smallArrowMinusImg from "../cursors/small_arrow_minus.png";
import smallArrowCrossImg from "../cursors/small_arrow_cross.png";

export default function getCursor(cursorName, keys, cursorState) {
  function getSelectionArrow() {
    if (keys.alt && keys.shift) {
      return smallArrowCrossImg
    } else if (keys.shift) {
      return smallArrowPlusImg
    } else if (keys.alt) {
      return smallArrowMinusImg
    } else {
      return smallArrowImg
    }
  }
  if (cursorState.button === 1 && cursorState.buttons === 4) {
    return "grabbing";
  }
  switch (cursorName) {
    case "pencil":
      return `url(${pencilImg}) -22 22, auto`;
    case "brush":
      return `url(${brushImg}) -22 22, auto`;
    case "line":
      return `url(${smallArrowImg}) 0 0, auto`;
    case "fillRect":
      return `url(${smallArrowImg}) 0 0, auto`;
    case "drawRect":
      return `url(${smallArrowImg}) 0 0, auto`;
    case "selectRect":
      return `url(${getSelectionArrow()}) 0 0, auto`;
    case "selectEllipse":
      return `url(${getSelectionArrow()}) 0 0, auto`;
    case "lasso":
      return `url(${getSelectionArrow()}) 0 0, auto`;
    case "selectionFill":
      return `url(${getSelectionArrow()}) 0 0, auto`;
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