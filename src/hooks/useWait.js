import { useState, useRef, useEffect } from "react";

export default function useWait(frames=0) {
  if (typeof frames !== "number" || frames < 0) {
    throw new TypeError("Error: Frames argument must be a positive number.", "useWait.js", 3);
  }
  
  const [state, setState] = useState(false);
  const [override, setOverride] = useState(false);

  const callbackRef = useRef(null);

  useEffect(() => {
    if (!state) {return};
    let count = 0;
    function wait() {
      requestAnimationFrame(async () => {
        if (count >= frames) {
          if (override) {
            callbackRef.current();
          } else {
            await callbackRef.current();
            setState(false);
            setOverride(false);
          }
        } else {
          count++;
          wait();
        }
      })
    }
    wait();
  }, [state, frames, override])

  function withCallback(callback, override=false) {
    callbackRef.current = callback;
    setOverride(override);
    setState(true);
  }

  return [state, withCallback];
}