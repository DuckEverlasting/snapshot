import React, { useEffect, useState, useCallback } from "react";
import useEventListener from "./useEventListener";

export default function useUpdateOnResize(ref) {
  const [refSize, setRefSize] = useState({ w: 0, h: 0 });

  const handleResize = useCallback(() => {
    if (!ref.current) {
      return;
    }
    setRefSize({
      w: ref.current.clientWidth,
      h: ref.current.clientHeight
    });
  }, [])

  useEffect(handleResize, []);

  useEventListener("resize", handleResize);

  return [refSize, setRefSize];
}