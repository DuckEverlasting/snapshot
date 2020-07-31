const handleResize = useCallback(() => {
  if (!boundingBoxRef.current) {
    return;
  }
  setBoxSize({
    w: boundingBoxRef.current.clientWidth,
    h: boundingBoxRef.current.clientHeight
  });
}, [])

useEffect(handleResize, []);

useEventListener("resize", handleResize);