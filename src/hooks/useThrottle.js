import React, { useState } from "react";

export default function useThrottle(callback, delay) {
  const [isThrottling, setIsThrottling] = useState(false);

  if (!isThrottling) {
    setIsThrottling(true)
    setTimeout(() => setIsThrottling(false), delay)
    return callback
  }
}