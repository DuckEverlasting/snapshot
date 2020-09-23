export default function selectFromActiveProject(...keys) {
  return state => {    
    const activeProject = state.main.activeProject;
    const result = new Array(keys.length);
    if (activeProject === null) {
      result.fill(null);
    } else {
      keys.forEach((key, i) => {
        result[i] = state.main.projects[activeProject].present[key];
      });
    }
    return result.length === 1 ? result[0] : result;
  }
}