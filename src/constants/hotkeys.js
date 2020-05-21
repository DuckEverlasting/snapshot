export const hotkey = {
  "p": {type: "activeTool", payload: "pencil"}, 
  "b": {type: "activeTool", payload: "brush"},
  "l": {type: "activeTool", payload: "lasso"},
  "e": {type: "activeTool", payload: "eraser"},
  "i": {type: "activeTool", payload: "eyeDropper"},
  "v": {type: "activeTool", payload: "move"},
  "m": {type: "activeTool", payload: "selectRect"},
  "h": {type: "activeTool", payload: "hand"},
  "z": {type: "activeTool", payload: "zoom"},
  "x": {type: "special", payload: "switchColors"},
  "Delete": {type: "special", payload: "clear"},
  "Backspace": {type: "special", payload: "clear"}
}

export const hotkeyCtrl = {
  "c": {type: "special", payload: "copy"},
  "v": {type: "special", payload: "paste"},
  "V": {type: "special", payload: "pasteToNew"},
  "j": {type: "special", payload: "duplicate"},
  "z": {type: "special", payload: "undo"},
  "Z": {type: "special", payload: "redo"},
  "d": {type: "special", payload: "deselect"},
  "L": {type: "special", payload: "newLayer"},
  "l": {type: "special", payload: "newLayer"},
  "M": {type: "activeTool", payload: "selectEllipse"}
}
