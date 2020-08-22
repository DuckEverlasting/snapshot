import { useEffect, useRef } from "react";

export default function useEventListener(event, callback, element=window) {
  const handler = useRef();

  useEffect(() => {
    handler.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!element || !element.addEventListener) return;

    const handleEvent = e => {
      handler.current(e);
    }

    element.addEventListener(event, handleEvent);
    
    return () => {
      element.removeEventListener(event, handleEvent);
    }

  }, [event, element]);

}