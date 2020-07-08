import manipulate from "../../reducers/custom/manipulateReducer";

export default function updateSelection() {
  return (dispatch, getState) => {
    const selectionCanvas = getState().main.present.layerCanvas.selection,
      selectionPath = getState().main.present.selectionPath;
    manipulate(selectionCanvas.getContext("2d"), {
      action: "clear",
      params: {}
    });
    
  }
}