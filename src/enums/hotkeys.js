export const hotkey = {
  "p": {type: "activeTool", payload: "pencil"}, 
  "b": {type: "activeTool", payload: "brush"},
  "l": {type: "activeTool", payload: "line"},
  "e": {type: "activeTool", payload: "eraser"},
  "i": {type: "activeTool", payload: "eyeDropper"},
  "v": {type: "activeTool", payload: "move"},
  "m": {type: "activeTool", payload: "selectRect"},
  "h": {type: "activeTool", payload: "hand"},
  "z": {type: "activeTool", payload: "zoom"},
  "x": {type: "special", payload: "switchColors"}
}

export const hotkeyCtrl = {
  "c": {type: "special", payload: "copy"},
  "v": {type: "special", payload: "paste"},
  "z": {type: "special", payload: "undo"}
}

export const hotkeyCtrlShift = {
  "z": {type: "special", payload: "redo"}
}